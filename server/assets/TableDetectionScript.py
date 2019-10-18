import camelot
import json

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

def extractRowData(row, allRows):
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
        if cell.text != '' or (index + 1 >= cellHSpan and cell.text == '' and len(cellsData) > 0):
            cellsData.append(cellInfo)        
        
    return cellsData

def extractRowsData(table):
    rowsData = [extractRowData(row, table.cells) for row in table.cells]    
    noEmptyRowsData = list(filter(lambda x: len(x) > 0, rowsData))    
    if len(noEmptyRowsData) == 0:
        return None

    return noEmptyRowsData

def extractTableData(table):    
    tableData = dict()
    tableData['size'] = getTableSize(table)
    tableData['location'] = getTableLocation(table)
    cellsData = extractRowsData(table)
    if cellsData != None:
        tableData['cells'] = cellsData
        return tableData
    
    return None

def createPageData(pageIndex, tables):
    pageData = dict()
    pageData['page'] = pageIndex
    pageData['tables'] = tables
    return pageData

def main():
    import sys
    pdfFile = str(sys.argv[1])
    flavor = str(sys.argv[2])
    lineScale = int(sys.argv[3])

    pages = 'all'
    if len(sys.argv) > 4:
        pages = str(sys.argv[4])

    tables = camelot.read_pdf(pdfFile,  pages=pages, flavor=flavor, line_scale=lineScale)

    if len(tables) == 0:
        #print('No tables detected ', tables)
        print(json.dumps([]))
        sys.exit(0)

    output = []
    distinctPages = set(list(map(lambda x: x.page, tables)))
    #print('Pages with tables: ', distinctPages)
    for page in distinctPages:
        tablesInPage = list(filter(lambda x: x.page == page, tables))
        #print('Current page', page)
        #print('Tables found', tablesInPage)
        tablesData = list(map(lambda x: extractTableData(x), tablesInPage))
        tablesData = list(filter(lambda x: x != None, tablesData))
        output.append(createPageData(page, tablesData))

    print(json.dumps(output))
    #print(output)
    sys.exit(0)


if __name__ == "__main__":
    main()