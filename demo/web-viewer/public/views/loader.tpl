<loader>

    <h1>Policy analysis</h1>
    <div id='name'></div>
    <div id='statut'></div>
    <script>

        function checkStatus() {
            $.getJSON('/status/'+  CURRENT_ID, function( data) {
                $('#name').html(data.originalname)
                $('#statut').html(data.status);


                if (data.status.split('_')[0] != '5') {
                    setTimeout(checkStatus.bind(this), 100);
                }
                else {
                    riot.mount('visualization')
                    this.unmount();
                }
                    
            }.bind(this));

         
        }

          this.on('mount', function() {


            setTimeout(checkStatus.bind(this), 100);





          });
    </script>
</loader>