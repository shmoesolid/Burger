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
            ).fail(
                function(xhr, textStatus, errorThrown)
                {
                    alert("Could not change devoured status!  See console log for details.")
                    console.log(xhr, textStatus, errorThrown);
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
                    console.log("Created new burger");
                    location.reload();
                }
            ).fail(
                function(xhr, textStatus, errorThrown)
                {
                    alert("Coult not add burger!  See console log for details.")
                    console.log(xhr, textStatus, errorThrown);
                }
            );
        }
    );
});