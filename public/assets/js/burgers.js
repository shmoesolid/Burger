$(function() {
    $(".change-devour").on("click", 
        function(event) 
        {
            
            var id = $(this).data("id");

            $.ajax("/api/burgers/" + id, 
                {
                    type: "PUT",
                    data: { devoured: 1 }
                }
            ).then(
                function() 
                {
                    console.log("change to devoured");
                    location.reload();
                }
            );
        }
    );

    $(".create-form").on("submit", 
        function(event) 
        {
            event.preventDefault();

            var newBurger = {
                burger_name: $("#burger").val().trim()
            };

            $.ajax("/api/burgers", 
                {
                    type: "POST",
                    data: newBurger
                }
            ).then(
                function()
                {
                    console.log("created new burger");
                    location.reload();
                }
            );
        }
    );
});