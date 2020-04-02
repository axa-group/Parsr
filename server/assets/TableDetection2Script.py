import sys
import camelot
import tabula
import json
from PyPDF2 import PdfFileReader
import numpy as np


# def getTableData(table):
#     data = []
#     for row in table['data']:
#         data.append([elem['text'] for elem in row])

#     return data

# def getCellFrame(cell):
#     cellData = dict()
#     cellData['location'] = {'x': cell['left'], 'y': cell['top']}
#     cellData['size'] = {'width': cell['width'], 'height': cell['height']}
#     cellData['colSpan'] = 1
#     cellData['rowSpan'] = 1
#     return cellData

# def updateCellColSpan(cell, row, index, cellInfo):
#     emptyCells = 1
#     width = cell['width']
#     for index, cell in enumerate(row, index + 1):
#         if cell['text'] == '':
#             emptyCells += 1
#             width += cell['width']

#     cellInfo['colSpan'] = emptyCells
#     cellInfo['size']['width'] = width
#     return cellInfo

# def updateCellRowSpan(cell, allRows, index, cellInfo):
#     emptyCells = 1
#     height = cell['height']
#     for row in allRows:
#         if row[index]['text'] == '':
#             emptyCells += 1
#             height += row[index]['height']

#     cellInfo['rowSpan'] = emptyCells
#     cellInfo['size']['height'] = height
#     return cellInfo

# def hspan(cell):
#     return False # temporary

# def vspan(cell):
#     return False # temporary

# def extractRowData(row, allRows):
#     cellsData = []
#     cellHSpan = 0
#     for index, cell in enumerate(row):
#         cellInfo = getCellFrame(cell)
#         if cell['text'] != '':      
#             if hspan(cell):
#                 cellInfo = updateCellColSpan(cell, row, index, cellInfo)                
            
#             if vspan(cell):
#                 cellInfo = updateCellRowSpan(cell, allRows, index, cellInfo)

#         cellHSpan += cellInfo['colSpan']
#         if cell['text'] != '' or (index + 1 >= cellHSpan and cell['text'] == '' and len(cellsData) > 0):
#             cellsData.append(cellInfo)        
        
#     return cellsData

# def extractRowsData(table):
#     rowsData = [extractRowData(row, table['data']) for row in table['data']]
#     noEmptyRowsData = list(filter(lambda x: len(x) > 0, rowsData))
#     if len(noEmptyRowsData) == 0:
#         return None
    
#     return noEmptyRowsData

# def extractTableData(table):    
#     tableData = dict()
#     tableData['size'] = {'width': table['width'], 'height': table['height']}
#     tableData['location'] = {'x': table['left'], 'y': table['bottom']}
#     tableData['content'] = getTableData(table)
#     cellsData = extractRowsData(table)
#     if cellsData != None:
#         tableData['cells'] = cellsData
#         return tableData
    
#     return None

# def createPageData(pageIndex, tables):
#     pageData = dict()
#     pageData['page'] = pageIndex
#     pageData['tables'] = tables
#     return pageData

# def main():
#     pdfFile = str(sys.argv[1])
#     infile = PdfFileReader(pdfFile, strict=False)
#     nb_pages = infile.getNumPages()

#     output = []
#     for i in range(nb_pages):
#         tables = tabula.read_pdf(pdfFile, stream=True, pages=i+1, output_format="json")
#         if len(tables) == 0:
#             continue
#         tablesData = list(map(lambda x: extractTableData(x), tables))
#         tablesData = list(filter(lambda x: x != None, tablesData))
#         output.append(createPageData(i+1, tablesData))

#     print(json.dumps(output))
#     sys.exit(0)


# if __name__ == "__main__":
#     main()

def getTableHeight(table):
    allY = []
    for item in table.rows:
        allY.extend(item)

    allY = list(allY)
    return max(allY) - min(allY)

def getTableWidth(table):
    allX = []
    for item in table.cols:
        allX.extend(item)

    allX = list(allX)
    return max(allX) - min(allX)

def getTableSize(table):
    size = dict()
    size['width'] = getTableWidth(table)
    size['height'] = getTableHeight(table)
    return size

def getTableLocation(table):
    allY = []
    for item in table.rows:
        allY.extend(item)

    allX = []
    for item in table.cols:
        allX.extend(item)

    location = dict()
    location['x'] = min(list(allX))
    location['y'] = max(list(allY))
    return location

def getCellSize(cell):
    size = dict()
    size['width'] = cell.x2 - cell.x1
    size['height'] = cell.y2 - cell.y1
    return size

def getCellLocation(cell):
    coords = []
    for coord in cell.lt:
        coords.append(coord)

    location = dict()
    location['x'] = coords[0]
    location['y'] = coords[1]
    return location

def getCellFrame(cell):
    cellData = dict()
    cellData['location'] = getCellLocation(cell)
    cellData['size'] = getCellSize(cell)
    cellData['colSpan'] = 1
    cellData['rowSpan'] = 1
    return cellData

def updateCellColSpan(cell, row, index, cellInfo):
    emptyCells = 1
    width = cell.x2 - cell.x1
    for index, cell in enumerate(row, index + 1):
        if cell.text == '':
            emptyCells += 1
            width += cell.x2 - cell.x1

    cellInfo['colSpan'] = emptyCells
    cellInfo['size']['width'] = width
    return cellInfo

def updateCellRowSpan(cell, allRows, index, cellInfo):
    emptyCells = 1
    height = cell.y2 - cell.y1
    for row in allRows:
        if row[index].text == '':
            emptyCells += 1
            height += row[index].y2 - row[index].y1

    cellInfo['rowSpan'] = emptyCells
    cellInfo['size']['height'] = height
    return cellInfo

def extractRowData(row, allRows, flavor):
    cellsData = []
    cellHSpan = 0    
    for index, cell in enumerate(row, 0):
        cellInfo = getCellFrame(cell)  
        if(cell.text != ''):      
            if cell.hspan:
                cellInfo = updateCellColSpan(cell, row, index, cellInfo)                
            
            if cell.vspan:
                cellInfo = updateCellRowSpan(cell, allRows, index, cellInfo)

        cellHSpan += cellInfo['colSpan']
        if flavor == 'stream' or cell.text != '' or (index + 1 >= cellHSpan and cell.text == '' and len(cellsData) > 0):
            cellsData.append(cellInfo)        
        
    return cellsData

def extractRowsData(table, flavor):
    rowsData = [extractRowData(row, table.cells, flavor) for row in table.cells]    
    noEmptyRowsData = list(filter(lambda x: len(x) > 0, rowsData))    
    if len(noEmptyRowsData) == 0:
        return None

    return noEmptyRowsData

def extractTableData(table, flavor):    
    tableData = dict()
    tableData['size'] = getTableSize(table)
    tableData['location'] = getTableLocation(table)
    tableData['content'] = table.data
    tableData['flavor'] = flavor
    cellsData = extractRowsData(table, flavor)
    if cellsData != None:
        tableData['cells'] = cellsData
        return tableData
    
    return None

def createPageData(pageIndex, tables):
    pageData = dict()
    pageData['page'] = pageIndex
    pageData['tables'] = tables
    return pageData

# def getTabulaTableData(table):
#     data = []
#     for row in table['data']:
#         data.append([elem['text'] for elem in row])
#     return np.ravel(data)

# def getCamelotTableData(table):
#     data = []
#     for text in np.ravel(table.data):
#         data.append(text.splitlines())        
    
#     return [line.strip() for sublist in data for line in sublist]

def getTabulaTableData(table):
    data = []
    for row in table['data']:
        for elem in row:
            data.append(elem['text'].split())
        
    return [word for sublist in data for word in sublist]

def getCamelotTableData(table):
    data = []
    for text in np.ravel(table.data):
        data.append(text.split())        
    
    return [word for sublist in data for word in sublist]

def checkWithTabula(tablesCamelot, tablesTabula):
    tables = []
    tablesTabula = list(map(lambda x: getTabulaTableData(x), tablesTabula))
    for tableCamelot in tablesCamelot:
        checkPassed = False
        for tableTabula in tablesTabula:
            camelotTableSet = set(getCamelotTableData(tableCamelot))
            tabulaTableSet = set(tableTabula)
            if len(camelotTableSet)==0:
                continue
            # 0.8 is a value to tune
            if len(camelotTableSet.intersection(tabulaTableSet)) / len(camelotTableSet) > 0.8:
                checkPassed = True
                
        if checkPassed:
            tables.append(tableCamelot)

    return tables


def main():
    pdfFile = str(sys.argv[1])

    # tables = camelot.read_pdf(pdfFile,  pages='all', flavor='lattice', line_scale=70, process_background=True)
    tables = camelot.read_pdf(pdfFile,  pages='all', flavor='lattice', line_scale=70, process_background=True)
    tables2 = tabula.read_pdf(pdfFile, stream=True, pages='all', output_format="json")

    if len(tables) == 0 and len(tables2) != 0:
        tables = camelot.read_pdf(pdfFile, flavor='stream', pages='all')
        
    tables = checkWithTabula(tables, tables2)

    if len(tables) == 0:
        print(json.dumps([]))
        sys.exit(0)

    output = []
    distinctPages = set(list(map(lambda x: x.page, tables)))
    for page in distinctPages:
        tablesInPage = list(filter(lambda x: x.page == page, tables))
        tablesData = list(map(lambda x: extractTableData(x, 'lattice'), tablesInPage))
        tablesData = list(filter(lambda x: x != None, tablesData))
        output.append(createPageData(page, tablesData))

    print(json.dumps(output))
    sys.exit(0)


if __name__ == "__main__":
    main()