<p align='center'>
  <img src="assets/logo.png" width="275"><br />
</p>

<h2 align="center"><i>Transforme seus documentos em dados!</i></h2>

<p align="center">
	<a href="https://cloud.drone.io/axa-group/Parsr"><img src="https://cloud.drone.io/api/badges/axa-group/Parsr/status.svg"></a>
</p>

<p align="center">
	<a href="README.md">English</a> |
  <a href="README_fr.md">Français</a> |  
  <a href="README_sp.md">Spanish</a> |
	<a href="README_zh-cn.md">中文</a>
</p>

<p align='center'>
  <img src="assets/demo_screen.gif">
</p>

- **Parsr** é uma cadeia de ferramentas para limpeza, análise e extração de documentos (imagem, pdf), que gera dados prontamente disponíveis, organizados e utilizáveis por desenvolvedores e cientistas de dados.

- Ele fornece aos usuários informações limpas, estruturadas e enriquecidas com rótulos, para aplicativos prontos para uso, que variam de entrada de dados e automação de análise de documentos, arquivamento e muitos outros.

- Atualmente, Parsr pode executar limpeza de documentos, regeneração de hierarquia (palavras, linhas, parágrafos), detecção de \*títulos, tabelas, listas, índices, número de páginas, cabeçalhos, rodapé e muito mais. Aqui está uma lista de todas as [todas as funcionalidades](server/src/processing/README.md#1-current-processing-modules).

# Índice

- [Índice](#índice)
- [Começando](#começando)
- [Instalação](#instalação)
- [Uso](#uso)
- [Documentação](#documentação)
- [Contribua](#contribua)
- [Licenças de Terceiros](#licenças-de-terceiros)
- [Licença](#licença)

# Começando

## Instalação

_-- O guia de instalação avançado está disponível [aqui](docs/installation.md) --_

A maneira mais rápida de instalar e executar a API (Interface de programação) de PARSR é através da [imagem docker](https://hub.docker.com/r/axarev/parsr):

```sh
docker pull axarev/parsr
```

Se você também deseja instalar a GUI para enviar documentos e visualizar resultados:

```sh
docker pull axarev/parsr-ui-localhost
```

Nota: Parsr também pode ser instalado a partir de um servidor bare-metal (não por contêineres do Docker), cujo procedimento está documentado no [guia de instalação](docs/installation.md).

## Uso

_-- O guia de uso avançado está disponível [aqui](docs/usage.md) --_

Para executar a [API](docs/api-guide.md), lance:

```sh
docker run -p 3001:3001 axarev/parsr
```

Este comando iniciará a API em [http://localhost:3001](http://localhost:3001).  
Consulte a documentação sobre o [uso da API](docs/api-guide.md).

1. Para acessar o cliente **python** na API de Parsr, lance:

   ```sh
   pip install parsr-client
   ```

   Para experimentar o **Jupyter Notebook**, usando o cliente python, vá para [demo jupyter](demo/parsr-jupyter-demo).

2) Para usar a ferramenta GUI (a API já deve estar em execução), lance:
   ```sh
   docker run -t -p 8080:80 axarev/parsr-ui-localhost:latest
   ```
   Em seguida, acesse-o através de [http://localhost:8080](http://localhost:8080).

Consulte a [Documentação de configuração](docs/configuration.md) para interpretar as opções configuráveis no visualizador da GUI.

O [Uso baseado em API](docs/usage.md#3-api) e o [uso da linha de comando](docs/usage.md#23-command-line-usage) estão documentados no [guia de uso avançado](docs/usage.md).

# Documentação

Todos os arquivos de documentação podem ser encontrados [aqui](docs/README.md).

# Contribua

Por favor, consulte as [diretrizes de contribuição](CONTRIBUTING.md).

# Licenças de Terceiros

Licenças de bibliotecas de terceiros para suas [dependências](docs/dependencies.md):

1. **QPDF**: Apache [http://qpdf.sourceforge.net](http://qpdf.sourceforge.net/)
2. **ImageMagick**: Apache 2.0 [https://imagemagick.org/script/license.php](https://imagemagick.org/script/license.php)
3. **Pdfminer.six**: MIT [https://github.com/pdfminer/pdfminer.six/blob/master/LICENSE](https://github.com/pdfminer/pdfminer.six/blob/master/LICENSE)
4. **PDF.js**: Apache 2.0 [https://github.com/mozilla/pdf.js](https://github.com/mozilla/pdf.js)
5. **Tesseract**: Apache 2.0 [https://github.com/tesseract-ocr/tesseract](https://github.com/tesseract-ocr/tesseract)
6. **Camelot**: MIT [https://github.com/camelot-dev/camelot](https://github.com/camelot-dev/camelot)
7. **MuPDF** (dependência opcional): AGPL [https://mupdf.com/license.html](https://mupdf.com/license.html)
8. **Pandoc** (dependência opcional): GPL [https://github.com/jgm/pandoc](https://github.com/jgm/pandoc)

# Licença

Direitos autorais 2020 AXA Group Operations S.A.  
Licenciado sob a licença [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) (consulte o arquivo [LICENÇA](LICENSE)).
