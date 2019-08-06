<visualization>

    <h1>Policy Details</h1>


    <div id='policy'></div>
    <script>
    
    
        this.on('mount', function() {
            $.getJSON('/analysed/' + CURRENT_ID, function(data) {
                console.log(data);    
                for (var i = 0; i < data.length; ++i) {  
                     var item = data[i];
                    if (!data[i].line) {
                        console.log(data[i]);
                        var block = $("<div class='block'>");
                                block.html('<b>' + item.label)
                        //$("#policy").append(block);
                        if (item.data) {
                            item = item.data
                        }
                        else {
                            continue;
                        }
                    }
             
                    var clause = $("<div class='clause'>");

                    if ( item.odds > .5) {
                        clause.html('<b>' + item.label + ' (' +  item.odds + ')</b><br/>' +item.line)
                    }
                    else {
                        clause.html('<b>unknown</b><br/>' +item.line)
                    }
                    
                    $("#policy").append(clause);


                }
            })
        });
    
    
    
    </script>
</visualization>