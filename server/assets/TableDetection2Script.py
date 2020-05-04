import sys
import camelot
import tabula
import json
import numpy as np


def get_table_height(table):
    all_y = []
    for item in table.rows:
        all_y.extend(item)

    all_y = list(all_y)
    return max(all_y) - min(all_y)

def get_table_width(table):
    all_x = []
    for item in table.cols:
        all_x.extend(item)

    all_x = list(all_x)
    return max(all_x) - min(all_x)

def get_table_size(table):
    size = dict()
    size['width'] = get_table_width(table)
    size['height'] = get_table_height(table)
    return size

def get_table_location(table):
    all_y = []
    for item in table.rows:
        all_y.extend(item)

    all_x = []
    for item in table.cols:
        all_x.extend(item)

    location = dict()
    location['x'] = min(list(all_x))
    location['y'] = max(list(all_y))
    return location

def get_cell_size(cell):
    size = dict()
    size['width'] = cell.x2 - cell.x1
    size['height'] = cell.y2 - cell.y1
    return size

def get_cell_location(cell):
    coords = []
    for coord in cell.lt:
        coords.append(coord)

    location = dict()
    location['x'] = coords[0]
    location['y'] = coords[1]
    return location

def get_cell_frame(cell):
    cell_data = dict()
    cell_data['location'] = get_cell_location(cell)
    cell_data['size'] = get_cell_size(cell)
    cell_data['colSpan'] = 1
    cell_data['rowSpan'] = 1
    return cell_data

def update_cell_col_span(cell, row, index, cell_info):
    empty_cells = 1
    width = cell.x2 - cell.x1
    for index, cell in enumerate(row, index + 1):
        if cell.text == '':
            empty_cells += 1
            width += cell.x2 - cell.x1

    cell_info['colSpan'] = empty_cells
    cell_info['size']['width'] = width
    return cell_info

def update_cell_row_span(cell, all_rows, index, cell_info):
    empty_cells = 1
    height = cell.y2 - cell.y1
    for row in all_rows:
        if row[index].text == '':
            empty_cells += 1
            height += row[index].y2 - row[index].y1

    cell_info['rowSpan'] = empty_cells
    cell_info['size']['height'] = height
    return cell_info

def extract_row_data(row, all_rows, flavor):
    cells_data = []
    cell_h_span = 0    
    for index, cell in enumerate(row, 0):
        cell_info = get_cell_frame(cell)  
        if(cell.text != ''):      
            if cell.hspan:
                cell_info = update_cell_col_span(cell, row, index, cell_info)                
            
            if cell.vspan:
                cell_info = update_cell_row_span(cell, all_rows, index, cell_info)

        cell_h_span += cell_info['colSpan']
        if flavor == 'stream' or cell.text != '' or (index + 1 >= cell_h_span and cell.text == '' and len(cells_data) > 0):
            cells_data.append(cell_info)        
        
    return cells_data

def extract_rows_data(table, flavor):
    rows_data = [extract_row_data(row, table.cells, flavor) for row in table.cells]    
    no_empty_rows_data = list(filter(lambda x: len(x) > 0, rows_data))    
    if len(no_empty_rows_data) == 0:
        return None

    return no_empty_rows_data

def extract_table_data(table, flavor):    
    table_data = dict()
    table_data['size'] = get_table_size(table)
    table_data['location'] = get_table_location(table)
    table_data['content'] = table.data
    table_data['flavor'] = flavor
    cells_data = extract_rows_data(table, flavor)
    if cells_data != None:
        table_data['cells'] = cells_data
        return table_data
    
    return None

def create_page_data(page_index, tables):
    page_data = dict()
    page_data['page'] = page_index
    page_data['tables'] = tables
    return page_data

def get_tabula_table_data(table):
    data = []
    for row in table['data']:
        for elem in row:
            data.append(elem['text'].split())
        
    return [word for sublist in data for word in sublist]

def get_camelot_table_data(table):
    data = []
    for text in np.ravel(table.data):
        data.append(text.split())        
    
    return [word for sublist in data for word in sublist]

def check_with_tabula(tables_camelot, tables_tabula):
    tables = []
    tables_tabula = list(map(lambda x: get_tabula_table_data(x), tables_tabula))
    for table_camelot in tables_camelot:
        check_passed = False
        for table_tabula in tables_tabula:
            camelot_table_set = set(get_camelot_table_data(table_camelot))
            tabula_table_set = set(table_tabula)
            if len(camelot_table_set)==0:
                continue
            # 0.8 is a value to tune
            if len(camelot_table_set.intersection(tabula_table_set)) / len(camelot_table_set) > 0.8:
                check_passed = True
                
        if check_passed:
            tables.append(table_camelot)

    return tables


def main():
    pdf_file = str(sys.argv[1])

    tables = camelot.read_pdf(pdf_file,  pages='all', flavor='lattice', line_scale=70)
    tables2 = tabula.read_pdf(pdf_file, stream=True, pages='all', output_format="json")

    if len(tables) == 0 and len(tables2) != 0:
        tables = camelot.read_pdf(pdf_file, flavor='stream', pages='all')
        
    tables = check_with_tabula(tables, tables2)

    if len(tables) == 0:
        print(json.dumps([]))
        sys.exit(0)

    output = []
    distinct_pages = set(list(map(lambda x: x.page, tables)))
    for page in distinct_pages:
        tables_in_page = list(filter(lambda x: x.page == page, tables))
        tables_data = list(map(lambda x: extract_table_data(x, 'lattice'), tables_in_page))
        tables_data = list(filter(lambda x: x != None, tables_data))
        output.append(create_page_data(page, tables_data))

    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()