<p align='center'>
  <img src="assets/logo.png" width="275">
</p>

<h2 align="center"><i>Transformez vos documents en données!</i></h2>

<p align="center">
	<a href="https://cloud.drone.io/axa-group/Parsr"><img src="https://cloud.drone.io/api/badges/axa-group/Parsr/status.svg"></a>
</p>

<p align="center">
	<a href="README.md">English</a> |
  <a href="README_pt.md">Portuguese</a> |
  <a href="README_sp.md">Spanish</a> |
	<a href="README_zh-cn.md">中文</a>
</p>

<p align='center'>
  <img src="assets/demo_screen.gif">
</p>

**Parsr** est une chaîne d'outils de nettoyage, d'analyse et d'extraction de documents (image, pdf) qui génère des données facilement disponibles, organisées et utilisables pour les développeurs et les scientifiques de données (data scientists).

Il fournit aux utilisateurs un ensemble d'informations structurées et enrichies de label propres pour des applications prêtes à l'emploi allant de l'automatisation de la saisie de données à l'analyse de documents, en passant par l'archivage et bien d'autres.

Actuellement, Parsr peut effectuer:

- Régénération de la hiérarchie des documents
- Mots, lignes et paragraphes
- Détection des titres
- Détection et reconstruction des tableaux
- Détection des listes
- Détection de l'ordre des paragraphes
- Reconnaissance des entités nommées (dates, pourcentages, etc.)
- Détection de paires clé-valeur (pour l'extraction d'entrées spécifiques basées sur un formulaire)
- Détection des numéros de page
- Détection d'entête et pied de page
- Détections de liens
- Suppression des espaces blancs

Parsr prend en entrée une image (.jpg, .png, .tiff, ...) ou un pdf et génère les formats de sortie suivants:

- JSON
- Markdown
- Texte
- CSV (pour les tableaux) ou Pandas Dataframes (voir [ici](demo/parsr-jupyter-demo))
- PDF

## Table des matières

- [Transformez vos documents en données!](#transformez-vos-documents-en-données) - [Table des matières](#table-des-matières) - [Débuter avec Parsr](#débuter-avec-parsr) - [Installation](#installation) - [Utilisation](#utilisation) - [Documentation](#documentation) - [Comment contribuer](#comment-contribuer) - [Licences tierces](#licences-tierces) - [Licence](#licence)

## Débuter avec Parsr

### Installation

_-- Le guide d'installation avancé est disponible [ici](docs/installation.md) --_

Le moyen le plus rapide pour installer et exécuter l'API Parsr est via [l'image docker](https://hub.docker.com/r/axarev/parsr):

```sh
docker pull axarev/parsr
```

Si vous souhaitez également installer l'interface graphique pour l'envoi de documents et la visualisation des résultats:

```sh
docker pull axarev/parsr-ui-localhost
```

Remarque: Parsr peut également être installé directement sur la machine (sans Docker)" - voir la procédure sur [guide d'installation](docs/installation.md).

### Utilisation

_-- Le guide d'utilisation avancé est disponible [ici](docs/usage.md) --_

Pour exécuter [l'API](docs/api-guide.md), lancez:

```sh
docker run -p 3001:3001 axarev/parsr
```

qui le lancera sur [http://localhost:3001](http://localhost:3001).
Consultez la documentation sur [l'utilisation de l'API](docs/api-guide.md).

1. Pour utiliser le client **python** de Parsr:

   ```sh
   t

   Pour utiliser le **Jupyter Notebook** utilisant ce client, [cliquez ici](demo/parsr-jupyter-demo).

   ```

2. Pour utiliser l'outil GUI (l'API doit déjà être en cours d'exécution), lancez:
   ```sh
   docker run -t -p 8080:80 axarev/parsr-ui-localhost:latest
   ```
   Ensuite, accédez-y via [http://localhost:8080](http://localhost:8080).

Reportez-vous à la [Documentation de configuration](docs/configuration.md) pour interpréter les options configurables dans l'interface graphique.

[Utilisation basée sur l'API](docs/usage.md#3-api) et [utilisation en ligne de commande](docs/usage.md#23-command-line-usage) sont documentées dans [utilisation avancée](docs/usage.md).

## Documentation

Tous les fichiers de documentation peuvent être trouvés [ici](docs/README.md) - actuellement en anglais seulement.

## Comment contribuer

Veuillez vous référer aux [directives de contribution](CONTRIBUTING.md).

## Licences tierces

Licences de bibliothèques tierces pour ces [dépendances](docs/dependencies.md):

1. **QPDF**: Apache [http://qpdf.sourceforge.net](http://qpdf.sourceforge.net/)
2. **ImageMagick**: Apache 2.0 [https://imagemagick.org/script/license.php](https://imagemagick.org/script/license.php)
3. **Pdfminer.six**: MIT [https://github.com/pdfminer/pdfminer.six/blob/master/LICENSE](https://github.com/pdfminer/pdfminer.six/blob/master/LICENSE)
4. **PDF.js**: Apache 2.0 [https://github.com/mozilla/pdf.js](https://github.com/mozilla/pdf.js)
5. **Tesseract**: Apache 2.0 [https://github.com/tesseract-ocr/tesseract](https://github.com/tesseract-ocr/tesseract)
6. **Camelot**: MIT [https://github.com/camelot-dev/camelot](https://github.com/camelot-dev/camelot)
7. **MuPDF** (Dépendance optionnelle): AGPL [https://mupdf.com/license.html](https://mupdf.com/license.html)
8. **Pandoc** (Dépendance optionnelle): GPL [https://github.com/jgm/pandoc](https://github.com/jgm/pandoc)

## Licence

Copyright 2019 AXA Group Operations S.A.
Sous licence [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) (voir le fichier [LICENSE](LICENSE)).
