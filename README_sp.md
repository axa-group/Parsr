<p align='center'>
  <img src="assets/logo.png" width="275"><br />
</p>

<h2 align="center"><i>¡Convierte tus documentos en datos!</i></h2>

<p align="center">
	<a href="https://cloud.drone.io/axa-group/Parsr"><img src="https://cloud.drone.io/api/badges/axa-group/Parsr/status.svg"></a>
</p>

<p align="center">
	<a href="README.md">English</a> |
	<a href="README_fr.md">Français</a> |
  <a href="README_pt.md">Portuguese</a> |
	<a href="README_zh-cn.md">中文</a>
</p>

<p align='center'>
  <img src="assets/demo_screen.gif">
</p>

- **Parsr** es una herramienta de parseo, extracción y limpieza de documentos (**imágenes, pdf, docx, eml**) de huella mínima, que genera datos organizados y usables en formato, **JSON, Markdown (MD), CSV/Pandas DF** o **TXT**.

- Provee información limpia y estructurada a analistas de datos y desarrolladores para aplicaciones que van desde ingreso de datos, automatización de análisis de documentos, archivos y muchas más.

- Actualmente, Parsr puede realizar limpieza de documentos, _regeneración de jerarquías_ (palabras, líneas, párrafos), detección de \*títulos, tablas, listas, tablas de contenido, número de páginas, cabeceras, pie de página y más. Aquí hay un listado de [todas las funcionalidades](server/src/processing/README.md#1-current-processing-modules).

# Tabla de Contenidos

- [Tabla de Contenidos](#tabla-de-contenidos)
- [Primeros Pasos](#primeros-pasos) - [Instalación](#instalación) - [Uso](#uso)
- [Documentación](#documentación)
- [Contribuir](#contribuir)
- [Licencias de Terceros](#licencias-de-terceros)
- [Licencia](#licencia)

# Primeros Pasos

## Instalación

_-- La guía de instalación avanzada está disponible [aquí](docs/installation.md) --_

La forma más rápida de instalar y ejecutar la API de Parsr es a través de la [imágen de Docker](https://hub.docker.com/r/axarev/parsr):

```sh
docker pull axarev/parsr
```

Si también quieres instalar la Interfaz Gráfica para enviar documentos y visualizar resultados:

```sh
docker pull axarev/parsr-ui-localhost
```

Nota: Parsr también puede ser instalado sin utilizar containers de Docker. El procedimiento a seguir está documentado en la [guía de instalación](docs/installation.md).

## Uso

_-- La guía de uso avanzado está disponible [aquí](docs/usage.md) --_

Para ejecutar la [API](docs/api-guide.md):

```sh
docker run -p 3001:3001 axarev/parsr
```

Este comando lanzará la API en [http://localhost:3001](http://localhost:3001).  
Consulta la documentación de [uso de la API](docs/api-guide.md).

1. Para acceder al cliente **python** de la API de Parsr:

   ````sh
   t
   `
   Para probar la **Jupyter Notebook** usando el cliente de Python, dirígete a la [demo jupyter](demo/parsr-jupyter-demo).

   ````

2. Para utilizar la interfaz gráfica de Parsr (la API debe estar lanzada previamente):
   ```sh
   docker run -t -p 8080:80 axarev/parsr-ui-localhost:latest
   ```
   Luego podrás acceder desde [http://localhost:8080](http://localhost:8080).

Consulta la [documentación de configuración](docs/configuration.md) para comprender las opciones configurables en la interfaz gráfica.

El [uso a través de la API](docs/usage.md#3-api) y el [uso por línea de comandos](docs/usage.md#23-command-line-usage) están documentados en la [guía de uso avanzado](docs/usage.md).

# Documentación

Toda la documentación está disponible [aquí](docs/README.md).

# Contribuir

Para contribuir con el proyecto, está disponible la [guía de contribución](CONTRIBUTING.md).

# Licencias de Terceros

Licencias de librerías de terceros para sus [dependencias](docs/dependencies.md):

1. **QPDF**: Apache [http://qpdf.sourceforge.net](http://qpdf.sourceforge.net/)
2. **ImageMagick**: Apache 2.0 [https://imagemagick.org/script/license.php](https://imagemagick.org/script/license.php)
3. **Pdfminer.six**: MIT [https://github.com/pdfminer/pdfminer.six/blob/master/LICENSE](https://github.com/pdfminer/pdfminer.six/blob/master/LICENSE)
4. **PDF.js**: Apache 2.0 [https://github.com/mozilla/pdf.js](https://github.com/mozilla/pdf.js)
5. **Tesseract**: Apache 2.0 [https://github.com/tesseract-ocr/tesseract](https://github.com/tesseract-ocr/tesseract)
6. **Camelot**: MIT [https://github.com/camelot-dev/camelot](https://github.com/camelot-dev/camelot)
7. **MuPDF** (Optional dependency): AGPL [https://mupdf.com/license.html](https://mupdf.com/license.html)
8. **Pandoc** (Optional dependency): GPL [https://github.com/jgm/pandoc](https://github.com/jgm/pandoc)

# Licencia

Copyright 2020 AXA Group Operations S.A.  
Licenciado bajo [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) (ver [licencia](LICENSE)).
