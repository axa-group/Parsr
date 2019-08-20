import { expect } from 'chai';
import 'mocha';
import { TableDetectionModule, TableExtractor, TableExtractorResult, Options } from '../server/src/modules/TableDetectionModule';
import { Element } from '../server/src/types/DocumentRepresentation/Element';
import { getPdf, runModules } from './helpers';
import { Table } from '../server/src/types/DocumentRepresentation/Table';
import * as fs from 'fs';
import { TableRow } from '../server/src/types/DocumentRepresentation';

const pdfName = 'table-detection.pdf';

class TableExtractorStub implements TableExtractor {
    private status: number;
    private stderr: string;
    private stdout: string;

    constructor(status: number = 0, stderr: string = "", stdout: string = "[]"){
        this.status = status;
        this.stderr = stderr;
        this.stdout = stdout;
    }

    readTables(_: string, _options: Options): TableExtractorResult {		
        return {
            stdout: this.stdout,
            stderr: this.stderr,
            status: this.status
        };
    }    
}

describe('No Table detection function', () => {
    let table: Element;	    
    const noTableDetectedExtractor = new TableExtractorStub(0, "", "[]");

	before(done => {
        getPdf(d => runModules(d, [new TableDetectionModule(null, noTableDetectedExtractor)]), pdfName)
        .then(([_, pdfAfter]) => {            			
            pdfAfter.pages[0].getElementsOfType<Table>(Table).forEach(elt => {
                table = elt;
            });
            done();
        });
	});

	it('should have no table detected', () => {
        expect(table).not.exist;
	});	
});

describe('One Table detection function', () => {
    let table: Table;
    let tableRows: TableRow[];
    const extractorOutput = fs.readFileSync(`${__dirname}/assets/mocks/table-detection-one-table.json`, 'utf8');    
    const oneTableDetectedExtractor = new TableExtractorStub(0,"", extractorOutput);

	before(done => {
        getPdf(d => runModules(d, [new TableDetectionModule(null, oneTableDetectedExtractor)]), pdfName)
        .then(([_, pdfAfter]) => {            			
            pdfAfter.pages[0].getElementsOfType<Table>(Table).forEach(elt => {                
                table = elt;
                tableRows = table.content;
            });
            done();
        });
	});

	it('should have one table detected', () => {
        expect(table).exist;
    });
    
    it('should have first row cell with row span', () => {
        expect(tableRows[0].content[0].rowspan).to.equal(2);
    });	
    
    it('should have first row last cell with col span', () => {
        expect(tableRows[0].content[4].colspan).to.equal(2);
	});	
});
