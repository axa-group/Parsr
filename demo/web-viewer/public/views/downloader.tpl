<downloader>
    <div class="jumbotron">
        <div class="container">
            <h1>Drag and drop a document</h1>
            <p>The document can be a PDF or an image.</p>
            <div id="dropzone" class="dropzone">
        </div>
    </div>

    <script>
   
        this.on('mount', function() {
           
            var myDropzone = new Dropzone("div#dropzone", { url: "/upload", timeout: Infinity });

            myDropzone.on("complete", function(file) {
                console.log(file);
                let json = JSON.parse(file.xhr.response);
                document.location = '/viewer.html?file=' + encodeURIComponent(json.filename);

              /*  CURRENT_ID = JSON.parse(file.xhr.response).id;
                myDropzone.removeFile(file);
                riot.mount('loader');
                this.unmount();
            */   }.bind(this));
            
        });
   </script>

</downloader>