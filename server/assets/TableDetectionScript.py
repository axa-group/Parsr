import camelot
import json


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


def update_cell_col_span(cell, row, colIndex, cell_info):
    empty_cells = 1
    width = cell.x2 - cell.x1
    finished = False
    for index, cell in enumerate(row, 0):
        if not finished and index > colIndex:
            if not cell.left:
                empty_cells += 1
                width += cell.x2 - cell.x1
            else:
                finished = True

    cell_info['colSpan'] = empty_cells
    cell_info['size']['width'] = width
    return cell_info


def update_cell_row_span(cell, all_rows, colIndex, rowIndex, cell_info):
    empty_cells = 1
    height = cell.y2 - cell.y1
    finished = False
    for index, row in enumerate(all_rows, 0):
        if not finished and index > rowIndex:
            if not row[colIndex].top:
                empty_cells += 1
                height += row[colIndex].y2 - row[colIndex].y1
            else:
                finished = True

    cell_info['rowSpan'] = empty_cells
    cell_info['size']['height'] = height
    return cell_info


def extract_row_data(row, all_rows, flavor, rowIndex):
    cells_data = []
    cell_h_span = 0
    for colIndex, cell in enumerate(row, 0):
        cell_info = get_cell_frame(cell)
        if(cell.text != ''):
            if cell.hspan or not cell.right:
                cell_info = update_cell_col_span(
                    cell, row, colIndex, cell_info)

            if cell.vspan or not cell.bottom:
                cell_info = update_cell_row_span(
                    cell, all_rows, colIndex, rowIndex, cell_info)

        cell_h_span += cell_info['colSpan']
        if flavor == 'stream' or cell.text != '' or (colIndex + 1 >= cell_h_span and cell.text == '' and len(cells_data) > 0):
            cells_data.append(cell_info)

    return cells_data


def extract_rows_data(table, flavor):
    rows_data = [extract_row_data(row, table.cells, flavor, rowIndex)
                 for rowIndex, row in enumerate(table.cells, 0)]

    # if the table starts with an empty cell, camelot will ignore
    # so this is to ensure it is available on the output
    if rows_data[0]:
        if rows_data[0][0]['location']['x'] > table.cells[0][0].x1:
            rows_data = add_first_cell(rows_data, table.cells[0][0])

    no_empty_rows_data = list(filter(lambda x: len(x) > 0, rows_data))
    if len(no_empty_rows_data) == 0:
        return None

    return no_empty_rows_data


def add_first_cell(rows_data, first_table_cell):
    first_cell_x = rows_data[0][0]['location']['x']
    height = rows_data[0][0]['size']['height']
    rows_data[0] = [{
        "location": {
            "x": first_table_cell.x1,
            "y": first_table_cell.y1 + height
        },
        "size": {
            "width": first_cell_x - first_table_cell.x1,
            "height": height
        },
        "colSpan": 1,
        "rowSpan": 1
    }] + rows_data[0]

    return rows_data


def extract_table_data(table, flavor):
    table_data = dict()
    table_data['size'] = get_table_size(table)
    table_data['location'] = get_table_location(table)
    table_data['content'] = table.data
    table_data['flavor'] = flavor
    table_data['rows'] = table.rows
    table_data['cols'] = table.cols
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


def main():
    import sys
    pdf_file = str(sys.argv[1])
    flavor = str(sys.argv[2])
    line_scale = int(sys.argv[3])

    pages = 'all'
    if len(sys.argv) > 4:
        pages = str(sys.argv[4])

    table_areas = None
    if len(sys.argv) > 5:
        table_areas = sys.argv[5].split(';')

    if flavor == 'lattice':
        tables = camelot.read_pdf(
            pdf_file,  pages=pages, flavor=flavor, line_scale=line_scale)
    else:
        tables = camelot.read_pdf(
            pdf_file,  pages=pages, flavor=flavor, table_areas=table_areas)

    if len(tables) == 0:
        #print('No tables detected ', tables)
        print(json.dumps([]))
        sys.exit(0)

    output = []
    distinct_pages = set(list(map(lambda x: x.page, tables)))
    #print('Pages with tables: ', distinct_pages)
    for page in distinct_pages:
        tables_in_page = list(filter(lambda x: x.page == page, tables))
        tables_data = list(
            map(lambda x: extract_table_data(x, flavor), tables_in_page))
        tables_data = list(filter(lambda x: x != None, tables_data))
        output.append(create_page_data(page, tables_data))

    print(json.dumps(output))
    # print(output)
    sys.exit(0)


if __name__ == "__main__":
    main()
