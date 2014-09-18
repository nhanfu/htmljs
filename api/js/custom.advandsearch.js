$(function (){
	$(".groupSearch").hide();
	var searchGroupHtml = $(".groupAdvancedSearch").html();
	$(".groupAdvancedSearch").html("");
	$("#firstFilter select").change(function(){
		if ($('option:selected').val()!=0) {
			$(".groupAdvancedSearch").append(searchGroupHtml);
			$(".showItem:last").hide();
			$(".showItem:last").click(function(){
				$(this).parent().next(".group_filter").fadeIn("fast");
				$(this).next(".hideItem").show();
				$(this).hide();
				
			});
			$(".hideItem:last").click(function(){
					$(this).parent().next(".group_filter").fadeOut("fast");
					$(this).prev(".showItem").show();
					$(this).hide();
				});
			$(".delItem:last").click(function(){
					$(this).parent().next(".group_filter").remove();
					$(this).parent().remove();
				});
			
			$(".name_selectbox:last").html($(this).children('option:selected').text() + ':');
			$(".secondFilter:last select").selectBox();
			$(".secondFilter:last select").change(function(){
				var nextSelector = $(this).parent().next(".thirdFilterSelect");
				var next2Selector = $(this).parent().next(".thirdFilterSelect").next(".thirdFilterinput");
				//alert(nextSelector.html())
				if($(this).val() == "showSelectBox"){
					 next2Selector.fadeOut("fast", function(){
						  nextSelector.children(".selectpicker").selectpicker();
							 nextSelector.fadeIn('slow');
						 });
					}
				else if($(this).val() == "showInput"){
					  nextSelector.fadeOut("fast", function(){
							 next2Selector.fadeIn('slow');
						 });
					}
				});
			}
		});
	});