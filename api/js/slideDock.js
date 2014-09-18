var docked = 0;
	$("#dock>li>ul").height($(window).height());
	/*
	$("#dock .dock").click(function(){
		$(this).parent().parent().addClass("docked").removeClass("free");
		docked += 1;
		var dockH = ($(window).height()) / docked
		var dockT = 0;
		$("#dock li ul.docked").each(function(){
			$(this).height(dockH).css("top", dockT + "px");
			dockT += dockH;
			});
		$(this).parent().find(".undock").show();
		$(this).hide();
		if (docked > 0)
			$("#content").css("margin-left","250px");
		else
			$("#content").css("margin-left", "60px");
		});
	
	 $("#dock .undock").click(function(){
		$(this).parent().parent().addClass("free").removeClass("docked").animate({right:"-150px"}, 200).height($(window).height()).css("top", "0px");
		docked = docked - 1;
		var dockH = ($(window).height()) / docked
		var dockT = 0;
		$("#dock li ul.docked").each(function(){
			$(this).height(dockH).css("top", dockT + "px");
			dockT += dockH;
			});
		$(this).parent().find(".dock").show();
		$(this).hide();
		if (docked > 0)
			$("#content").css("margin-left", "250px");
		else
			$("#content").css("margin-left", "60px");
		});*/
	$("#dock>li>ul>li>ul").hide();
	$("#dock>li").hover(function(){
		$(this).children("ul").show("fast");
		
		}, function(){
			$(this).find("ul.free").hide("fast");
			$("#dock>li>ul>li>ul").hide();
   		});
   $("#dock>li>ul>li").click(function(){
		if(!$(this).children("ul").is(":visible")){
			$("#dock>li>ul>li>ul").slideUp();
			$(this).children("ul").slideDown();	
			}
		else{
			$("#dock>li>ul>li>ul").slideUp();
			}
	   });
	   
	// ACCORDION
	$("#dock").hide();
	$("#navBtn").click(function(){
		if(!$("#dock").is(":visible"))
			$("#dock").slideDown("fast", function(){
					$("#dock").addClass("overflowVisible");
				});
		else
		{
			$("#dock").removeClass("overflowVisible");
			$("#dock").slideUp();
		}
		})