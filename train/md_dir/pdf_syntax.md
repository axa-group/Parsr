# 7 Syntax

## 7.1 General

This clause covers everything about the syntax of PDF at the object, file, and document level. It sets the stage for subsequent clauses, which describe how the contents of a PDF file are interpreted as page descriptions, interactive navigational aids, and application-level logical structure.

PDF syntax is best understood by considering it as four parts, as shown in Figure 1:

- *Objects.* A PDF document is a data structure composed from a small set of basic types of data objects. Sub-clause 7.2, "Lexical Conventions," describes the character set used to write objects and other syntactic elements. Sub-clause 7.3, "Objects," describes the syntax and essential properties of the objects. Sub-clause 7.3.8, "Stream Objects," provides complete details of the most complex data type, the stream object.

- *File structure.* The PDF file structure determines how objects are stored in a PDF file, how they are accessed, and how they are updated. This structure is independent of the semantics of the objects. Sub-clause 7.5, "File Structure," describes the file structure. Sub-clause 7.6, "Encryption," describes a file-level mechanism for protecting a document’s contents from unauthorized access.

- *Document structure.* The PDF document structure specifies how the basic object types are used to represent components of a PDF document: pages, fonts, annotations, and so forth. Sub-clause 7.7, "Document Structure," describes the overall document structure; later clauses address the detailed semantics of the components.

- *Content streams.* A PDF *content stream* contains a sequence of instructions describing the appearance of a page or other graphical entity. These instructions, while also represented as objects, are conceptually distinct from the objects that represent the document structure and are described separately. Sub-clause 7.8, "Content Streams and Resources," discusses PDF content streams and their associated resources.

### Figure 1 – PDF Components

In addition, this clause describes some data structures, built from basic objects, that are so widely used that they can almost be considered basic object types in their own right. These objects are covered in: 7.9, "Common Data Structures"; 7.10, "Functions"; and 7.11, "File Specifications."

NOTE Variants of PDF’s object and file syntax are also used as the basis for other file formats. These include the Forms Data Format (FDF), described in [12.7.7, "Forms Data Format",](#M11.9.16846.1Heading.78.Forms.Data.Format.PDF.Appendix.H) and the Portable Job Ticket Format (PJTF), described in Adobe Technical Note \#5620, *Portable Job Ticket Format.*

## 7.2 Lexical Conventions

### 7.2.1 General

At the most fundamental level, a PDF file is a sequence of bytes. These bytes can be grouped into *tokens* according to the syntax rules described in ths sub-clause. One or more tokens area ssembled to form higher-

---

level syntactic entities, principally *objects,* which are the basic data values from which a PDF document is constructed.

A non-encrypted PDF can be entirely represented using byte values corresponding to the visible printable subset of the character set defined in ANSI X3.4-1986, plus white space characters. However, a PDF file is not restricted to the ASCII character set; it may contain arbitrary bytes, subject to the following considerations:

- The tokens that delimit objects and that describe the structure of a PDF file shall use the ASCII character set. In addition all the reserved words and the names used as keys in PDF standard dictionaries and certain types of arrays shall be defined using the ASCII character set.

- The data values of strings and streams objects may be written either entirely using the ASCII character set or entirely in binary data. In actual practice, data that is naturally binary, such as sampled images, is usually represented in binary for compactness and efficiency.

- A PDF file containing binary data shall be transported as a binary file rather than as a text file to insure that all bytes of the file are faithfully preserved.

NOTE 1 A binary file is not portable to environments that impose reserved character codes, maximum line lengths, end-of-line conventions, or other restrictions

NOTE 2 In this clause, the usage of the term character is entirely independent of any logical meaning that the value may have when it is treated as data in specific contexts, such as representing human-readable text or selecting a glyph from a font.

### 7.2.2 Character Set

The PDF character set is divided into three classes, called *regular, delimiter,* and *white-space* characters. This classification determines the grouping of characters into tokens. The rules defined in this sub-clause apply to all characters in the file except within strings, streams, and comments.

The *White-space characters* shown in Table 1 separate syntactic constructs such as names and numbers from each other. All white-space characters are equivalent, except in comments, strings, and streams. In all other contexts, PDF treats any sequence of consecutive white-space characters as one character.

### Table 1 – White-space characters

| ##### Decimal | ##### Hexadecimal | ##### Octal | ##### Name |  
|---|---|---|---|  
| 0 | 00 | 000 | Null (NUL) |  
| 9 | 09 | 011 | HORIZONTAL TAB (HT) |  
| 10 | 0A | 012 | LINE FEED (LF) |  
| 12 | 0C | 014 | FORM FEED (FF) |  
| 13 | 0D | 015 | CARRIAGE RETURN (CR) |  
| 32 | 20 | 040 | SPACE (SP) |  

The CARRIAGE RETURN (0Dh) and LINE FEED (0Ah) characters, also called *newline characters,* shall be treated as *end-of-line* (EOL) markers. The combination of a CARRIAGE RETURN followed immediately by a LINE FEED shall be treated as one EOL marker. EOL markers may be treated the same as any other white- space characters. However, sometimes an EOL marker is required or recommended—that is, preceding a token that must appear at the beginning of a line.

NOTE The examples in this standard use a convention that arranges tokens into lines. However, the examples’ use of white space for indentation is purely for clarity of exposition and need not be included in practical use.

---

The *delimiter characters* (, ), <, >, [, ], \{, \}, /, and % are special (LEFT PARENTHESIS (28h), RIGHT PARENTHESIS (29h), LESS-THAN SIGN (3Ch), GREATER-THAN SIGN (3Eh), LEFT SQUARE BRACKET (5Bh), RIGHT SQUARE BRACKET (5Dh), LEFT CURLY BRACE (7Bh), RIGHT CURLY BRACE (07Dh), SOLIDUS (2Fh) and PERCENT SIGN (25h), respectively). They delimit syntactic entities such as arrays, names, and comments. Any of these characters terminates the entity preceding it and is not included in the entity. Delimiter characters are allowed within the scope of a string when following the rules for composing strings; see 7.3.4.2, “Literal Strings”. The leading ( of a string does delimit a preceding entity and the closing ) of a string delimits the string’s end.

### Table 2 – Delimiter characters

| ##### Glyph | ##### Decimal | ##### Hexadecimal | ##### Octal | ##### Name |  
|---|---|---|---|---|  
| ( | 40 | 28 | 50 | LEFT PARENTHESIS |  
| ) | 41 | 29 | 51 | RIGHT PARENTHESIS |  
| < | 60 | 3C | 60 | LESS-THAN SIGN |  
|> | 62 | 3E | 62 | GREATER-THAN SIGN |  
| [ | 91 | 5B | 133 | LEFT SQUARE BRACKET |  
| ] | 93 | 5D | 135 | RIGHT SQUARE BRACKET |  
| \{ | 123 | 7B | 173 | LEFT CURLY BRACKET |  
| \} | 125 | 7D | 175 | RIGHT CURLY BRACKET |  
| / | 47 | 2F | 57 | SOLIDUS |  
| % | 37 | 25 | 45 | PERCENT SIGN |  

All characters except the white-space characters and delimiters are referred to as *regular characters.* These characters include bytes that are outside the ASCII character set. A sequence of consecutive regular characters comprises a single token. PDF is case-sensitive; corresponding uppercase and lowercase letters shall be considered distinct.

### 7.2.3 Comments

Any occurrence of the PERCENT SIGN (25h) outside a string or stream introduces a *comment.* The comment consists of all characters after the PERCENT SIGN and up to but not including the end of the line, including regular, delimiter, SPACE (20h), and HORZONTAL TAB characters (09h). A conforming reader shall ignore comments, and treat them as single white-space characters. That is, a comment separates the token preceding it from the one following it.

EXAMPLE The PDF fragment in this example is syntactically equivalent to just the tokens abc and 123.

abc% comment ( /% ) blah blah blah 123

Comments (other than the %PDF–n.m and %%EOF comments described in 7.5, "File Structure") have no semantics. They are not necessarily preserved by applications that edit PDF files.

## 7.3 Objects

### 7.3.1 General

PDF includes eight basic types of objects: Boolean values, Integer and Real numbers, Strings, Names, Arrays, Dictionaries, Streams, and the null object.

