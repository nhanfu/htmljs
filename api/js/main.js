$(function () {
	/***************************************************************************
		NAVIGATION LEFT
	****************************************************************************/
	if($("#tblFeed tr").length){
		$("#tblFeed tr").hover(function(){
			$(this).children('td').children('a').children('i').toggleClass('hidden');
		});
	}
	/***************************************************************************
		SCROLL TABLE BODY - PAYMENT HISTORY
	****************************************************************************/
	if ($('#paymentTbl').length){
		$('#paymentTbl').scrollTableBody({rowsToDisplay:4});
	}
	/***************************************************************************
		SCROLL TABLE BODY - PAYMENT HISTORY
	***************************************************************************/	
	if ($('.sTip').length){
		$(".sTip").tooltip(); 
	}
	/***************************************************************************
		SELECT BOX
	****************************************************************************/
	$("select").not(".selectpicker").selectBox();
	//$(".adSearchCont").hide();
	/***************************************************************************
		SEARCH BOX
	****************************************************************************/
	$(".adSearchDown").click(function(){
		if($(this).hasClass("active")){
			$(".adSearchCont").removeClass('overflowVisible');
			$(".adSearchCont").slideUp('slow');
			$(this).removeClass('active');
			
		}else{
			$(".adSearchCont").slideDown('slow', function(){
					$(".adSearchCont").addClass('overflowVisible');
				});
			$(this).addClass('active');
			}
	});
	$(".searchActivation").click(function(){
		$(".adSearchDown").trigger("click");
	});
	
	$(".filterAdSearchDown").click(function(){		
		if($(this).hasClass("active")){
			$(".advancedSearchWrapper").removeClass('overflowVisible');
			$(".advancedSearchWrapper").slideUp('slow');
			$(this).removeClass('active');
			
		}else{
			$(".advancedSearchWrapper").slideDown('slow', function(){
					$(".advancedSearchWrapper").addClass('overflowVisible');
				});
			$(this).addClass('active');
			}
		});
	
	/***************************************************************************
		SELECT PICKER 
	****************************************************************************/
	if ($('.selectpicker').length > 0) {
	   	$('.selectpicker').selectpicker();
   		}
	/***************************************************************************
		TABLE 
	****************************************************************************/
	$("#tbl-bullet").click(function(){
		$(".tbl-drop").slideDown('slow');
		});
	/***************************************************************************
		TABLE DROP DOWN
	****************************************************************************/
	$(".close").click(function(){
		$(".tbl-drop").slideUp('slow');
		});
	/***************************************************************************
		TABLE TOGGLE 
	****************************************************************************/
	$('a.viewTblInner').click(function(){
		if($(this).children("i").hasClass("fa-eye"))
			{
				$(this).children("i").removeClass("fa-eye");	
				$(this).children("i").addClass("fa-eye-slash");
				
			}
		else if($(this).children("i").hasClass("fa-eye-slash"))
			{
				$(this).children("i").removeClass("fa-eye-slash");	
				$(this).children("i").addClass("fa-eye");
				
			}
		$(this).parent().parent().next("tr.tblInner").slideToggle('fast');
		});
	/***************************************************************************
		TABLE ROW CLICKABLE 
	****************************************************************************/
	$(".clickableRow").click(function(){
		window.document.location = $(this).attr("href");
		});
	$(".tbl-dropdown").click(function(e){
		e.stopPropagation();
		});
	
	/***************************************************************************
		CHECKBOX FOR MODAL
	****************************************************************************/
	$('#cbbAllExport').change(function () {
		var isChecked = $(this).is(':checked');
		var region = $(this).next('div.overflow').eq(0);
		region.find('input.checkbox-inline').each(function (index) {
			$(this).prop('checked', isChecked);
		});
	});
	
	$('#cbbAllAssign').change(function () {
		var isChecked = $(this).is(':checked');
		var region = $(this).next('div.overflow').eq(0);
		region.find('input.checkbox-inline').each(function (index) {
			$(this).prop('checked', isChecked);
		});
	});	
	/***************************************************************************
		CHECKBOX FOR TBLFEED
	****************************************************************************/
	$('#cbbAll').change(function () {
		var isChecked = $(this).is(':checked');
		$('.tblFeed').find('input.checkbox').each(function (index) {
			$(this).prop('checked', isChecked);
			})
		});
	/***************************************************************************
		COMPARE HEIGHT BETWEEN feedEntry & feefContent
	****************************************************************************/
	if ($(".feedEntry").height() > $(".feedContent").height()){
		console.log('a');
		$(".feedEntry").css("border-right","1px solid #DDDDDD");
		$(".feedContent").css("border-left","none");
		}
	else {
		$(".feedContent").css("border-left","1px solid #DDDDDD");
		$(".feedEntry").css("border-right","none");
		}
	/***************************************************************************
		NAVIGATION LEFT
	****************************************************************************/
	$('#navList li a').click(function(){	
		var selector = $(this).parent('#navList li');
		if (selector.children('#navList ul.sub').eq(0).length){
			if (selector.children('#navList ul.sub').eq(0).hasClass('hid')){	
				selector.children('#navList ul.sub').eq(0).slideDown('slow');
				selector.children('#navList ul.sub').eq(0).removeClass('hid');
				selector.children('a').children('i').removeClass('fa-angle-down');
				selector.children('a').children('i').addClass('fa-angle-up');
				}
			else{
				selector.children('#navList ul.sub').eq(0).slideUp('slow');					
				selector.children('#navList ul.sub').eq(0).addClass('hid');	
				selector.children('a').children('i').removeClass('fa-angle-up');				
				selector.children('a').children('i').addClass('fa-angle-down');
				}
			}
		});
	/***************************************************************************
		ALLOCATION LIST -- IMAGING TOOL
	****************************************************************************/
	if ($('.checkList li a').length)	{
		$('.checkList li a').click(function(){	
			var selector = $(this).parent('.checkList li');
			if (selector.children('.checkList ul.sub').eq(0).length){
				if (selector.children('.checkList ul.sub').eq(0).hasClass('hid')){	
					selector.children('.checkList ul.sub').eq(0).slideDown('slow');
					selector.children('.checkList ul.sub').eq(0).removeClass('hid');
					selector.children('a').children('i').removeClass('fa-angle-down');
					selector.children('a').children('i').addClass('fa-angle-up');
					}
				else{
					selector.children('.checkList ul.sub').eq(0).slideUp('slow');					
					selector.children('.checkList ul.sub').eq(0).addClass('hid');	
					selector.children('a').children('i').removeClass('fa-angle-up');				
					selector.children('a').children('i').addClass('fa-angle-down');
					}
				}
			});
		}
	if ($('.checkList li dl dd a').length)	{
		$('.checkList li dl dd a').click(function(){
			var selector = $(this).parent('dd').parent('dl').parent('.checkList li');
			if (selector.children('ul.sub').eq(0).length){
				if (selector.children('ul.sub').eq(0).hasClass('hid')){	
					selector.children('ul.sub').eq(0).slideDown('slow');
					selector.children('ul.sub').eq(0).removeClass('hid');
					$(this).children('i').removeClass('fa-angle-down');
					$(this).children('i').addClass('fa-angle-up');
					}
				else{
					selector.children('ul.sub').eq(0).slideUp('slow');					
					selector.children('ul.sub').eq(0).addClass('hid');	
					$(this).children('i').removeClass('fa-angle-up');				
					$(this).children('i').addClass('fa-angle-down');
					}
				}
			});
		}
	/***************************************************************************
		EQUALIZE BOX SEPERATE HEIGHT
	****************************************************************************/
	var boxH1 = $("#box01").height(); 
	var boxH2 = $("#box02").height(); 
	var boxH3 = $("#box03").height(); 
	var maxH = 0;
	if (boxH1 > maxH) {maxH = boxH1;}
	if (boxH2 > maxH) {maxH = boxH2;} 
	if (boxH3 > maxH) {maxH = boxH3;} 
	$("#box01 .boxBdrGrey").height(maxH);
	$("#box02 .boxBdrGrey").height(maxH);
	$("#box03 .boxBdrGrey").height(maxH);
	/***************************************************************************
		DROP DOWN PANEL ON THE LEFT -- IMAGING TOOL
	****************************************************************************/
	// drop down panel on the left
	if ((".panel-heading").length){
		$(".panel-heading").click(function(){
			var content = $(this).next(".panel-body");
			if (content.css('display')=='block'){
				content.slideUp('slow');
				$(this).children('a').children('i').removeClass('fa-angle-up');
				$(this).children('a').children('i').addClass('fa-angle-down');
			}else{
				$(".panel-body").slideUp('slow');
				$(this).next(".panel-body").slideDown('slow');
				$(".panel-heading").children('a').children('i').removeClass('fa-angle-up');
				$(".panel-heading").children('a').children('i').addClass('fa-angle-down');
				$(this).children('a').children('i').removeClass('fa-angle-down');
				$(this).children('a').children('i').addClass('fa-angle-up');
			}
		});
	}
	/***************************************************************************
		EQUALIZE CONTENT HEIGHT -- IMAGING TOOL
	****************************************************************************/
	//equalize height between contents (left, right)
	if ($(".leftContent").length){
		if ($(".leftContent").height() > $(".rightContent").height()){
			console.log('a');
			$(".leftContent").css("border-right","1px solid #DDDDDD");
			$(".rightContent").css("border-left","none");
		}
		else {
			console.log('b');
			$(".rightContent").css("border-left","1px solid #DDDDDD");
			$(".leftContent").css("border-right","none");
		}
	}
	/***************************************************************************
		SEARCH -- IMAGING TOOL
	****************************************************************************/
	$(".cbResultAll").change(function(){
			if($(this).is(":checked")){
				$(".table tbody tr td input[type=checkbox]:not(checked)").attr("checked","checked");
			}else{
				$(".table tbody tr td input[type=checkbox]:checked").removeAttr("checked");
			}
		});
	/***************************************************************************
		ALLOCATION PAGE -- IMAGING TOOL
	****************************************************************************/
		/* Checkbox Select ALl */
	$(".cbAllocationAll").click(function(){
		$(this).parent('div').parent('div').parent("div.boxBdrGrey").find($(".checkList input:checkbox")).attr("checked","checked");
	});
	$(".cbAllocationClear").click(function(){
		$(this).parent('div').parent('div').parent("div.boxBdrGrey").find($(".checkList input:checkbox")).removeAttr("checked");
	});
	$(".checkList input").change(function(){
		var selector = $(this).parent('dt').parent('dl');		
		if (selector.next("ul.sub").length){
			if ($(this).is(":checked")){	
				selector.next("ul.sub").find('input:checkbox:not(:checked)').attr("checked", "checked");
			}else{
				selector.next("ul.sub").find('input:checkbox:checked').removeAttr("checked");
			}
		}
	});
	/***************************************************************************
		MODAL BUTTON ACTION -- IMAGING TOOL
	****************************************************************************/
	/* button action on modal to show hide alert */
		$(".modal .btnCancel").click(function(){
			$('.alert-warning').fadeIn('slow');
			$(".modal .btnNormal").addClass('btnDisable');
			$(".modal .btnNormal").attr('disabled','disabled');
		});
		$(".modal .btnGrey").click(function(){
			if ($(this).val() =="OK"){
				$('.modal').modal('hide');
			}
			$('.alert-warning').fadeOut('slow');
			$('.modal .btnNormal').removeClass('btnDisable');
			$(".modal .btnNormal").removeAttr('disabled');
		});
		$(".modal .btnDelete").click(function(){
			$('.alert-success').fadeIn('slow');			
			$(".modal .btnNormal").addClass('btnDisable');
			$(".modal .btnNormal").attr('disabled','disabled');
		});
		/* button action on modal to show hide alert success */
		$(".alert-success .btnBlue").click(function(){
			if ($(this).val() =="OK"){
				$('.modal').modal('hide');
			}
			$('.alert').fadeOut('slow');
			$('.modal .btnNormal').removeClass('btnDisable');
			$(".modal .btnNormal").removeAttr('disabled');
		});
		$(".modal .btnSave").click(function(){
			$('.alert-success').fadeIn('slow');
			$(".modal .btnNormal").addClass('btnDisable');
			$(".modal .btnNormal").attr('disabled','disabled');
		});
		
		$("#delDocKey .btnDelete").click(function(){
			$('.alert-success').fadeIn('slow');
			$(".modal .btnNormal").addClass('btnDisable');
			$(".modal .btnNormal").attr('disabled','disabled');
		});
		
		
		$(".modal .cbBizAll").change(function(){
			if($(this).is(':checked')){
				$("#addDocKey .overflow").find("input:checkbox:not(:checked)").attr("checked","checked");
			}else{
				$("#addDocKey .overflow").find("input:checkbox:checked").removeAttr("checked");
			}
		});
		$(".modal .btnAdd").click(function(){
			$('.alert-success').fadeIn('slow');
			$(".modal .btnNormal").addClass('btnDisable');
			$(".modal .btnNormal").attr('disabled','disabled');
		});		
		$("#btnPrioSave").click(function(){
			$(".alert-success").fadeIn('slow');
		});
		
	/***************************************************************************
		DATE PICKER -- IMAGING TOOL
	****************************************************************************/
	$('#datepicker').datepicker();
	/***************************************************************************
		LOADING SCREEN
	****************************************************************************/
	$('#btnLoading').click(function(){
		$('.loading').fadeIn('slow');
	});
	var opts = {
	  lines: 12, // The number of lines to draw
	  length: 10, // The length of each line
	  width: 5, // The line thickness
	  radius: 13, // The radius of the inner circle
	  corners: 1, // Corner roundness (0..1)
	  rotate: 0, // The rotation offset
	  direction: 1, // 1: clockwise, -1: counterclockwise
	  color: '#FFF', // PLEASE USE YOUR TOOL MAIN COLOR
	  speed: 1, // Rounds per second
	  trail: 60, // Afterglow percentage
	  shadow: false, // Whether to render a shadow
	  hwaccel: false, // Whether to use hardware acceleration
	  className: 'spinner', // The CSS class to assign to the spinner
	  zIndex: 2e9, // The z-index (defaults to 2000000000)
	  top: '50%', // Top position relative to parent
	  left: '50%' // Left position relative to parent
	};
	var target = document.getElementById('loading-icon');
	var spinner = new Spinner(opts).spin(target);
	$('.loading').click(function(){			
		if ($('.loading').css('display')=='block'){
			$('.loading').fadeOut('slow');
		}
	});
});