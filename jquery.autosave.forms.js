var show_unsaved_warning = false;
var checked_direct = false;
//find all avaliable form elements in a given element
//get there existing values (if any) and store them in objects else where through
//invoking this function
function findAllFormElements(formElem)
{
	//detect all form elemets on the page in a given form/container
	formObj = {};
	$(formElem).find(':input').each(function(key, val)
	{
		var endVal = null;
		if($(val).getType() != 'button')
		{
			if($(val).getType() == 'radio' || $(val).getType() == 'checkbox')
			{
				if($(val).is(':checked'))
				{
					endVal = 'checked';
				}
				else
				{
					endVal = 'unchecked';
				}
			}
			else
			{
				if($(val).val() != null || $(val).val() != undefined || $(val).val() != ''){endVal = $(val).val();}
			}
			formObj[$(val).attr('name')] = {
									input_name: $(val).attr('name'),
									input_type: $(val).getType(),
									input_val: endVal
									};

			if($(val).getType() == 'radio' || $(val).getType() == 'checkbox')
			{
				var attr = $(this).attr('class');
				if (typeof attr !== 'undefined' && attr !== false)
				{
					formObj[$(val).attr('name')].realVal = $(val).val();
					formObj[$(val).attr('name')].className = attr;
				}
				else
				{
					formObj[$(val).attr('name')].realVal = null;
					formObj[$(val).attr('name')].className = null;
				}
			}
		}
	});
	 return formObj;
}
//populate forms based off of above function
function runFormsPopulate(getObj, formEl, priority)
{
	if(nullCheck(priority) == true){priority = false;}
	$.each(getObj, function(key, value)
	{
		//console.log(key, value);
		if(priority == true)
		{
			//todo add to "priority listing"
		}
		var $elem = $('#'+key);
		var $elemPar = $elem.parent('.tree_header_trigger').parent('.tree_header');
		if($('#'+key).length > 0)
		{
			if($elem.getType() == 'text')
			{
				$elem.val(value);
				if(value != $elem.attr('placeholder') && nullCheck(value) == false)
				{
					//console.log(value + ' '+ $elem.val() +' - '+ $elem.attr('name') + ': ' + $elem.attr('placeholder'))
					if($elem.attr('data-headcheck'))
					{
						$elemPar.addClass('bold').next('ul').addClass('tree_open');
					}
				}
				if($elem.data('multiple') == "yes" && value != $elem.attr('placeholder') && nullCheck(value) == false)
				{
					$elemPar.next('ul').find('.tree_header').addClass('bold');
					$elem.parentsUntil('.tree_collapse').addClass('tree_open');
					$elem.parents('li.tree_level').find('.visual_asthetics').attr('checked', true);
				}
			}

			//data-headcheck="yes"
			else if($elem.getType() == 'radio' || $elem.getType() == 'checkbox')
			{
				boolVal = $elem.attr('data-flip_selection') ? !getBoolFromString(value) : getBoolFromString(value);
				$elem.attr('checked', boolVal)
				if($elem.is(':checked'))
				{
					//if checkbox/radio is in header element and has headcheck data attribute
					//this will invoke the headers click event
					if($elem.attr('data-headcheck'))
					{
						$elemPar.addClass('bold').next('ul').addClass('tree_open');
					}
				}
			}



			else if($elem.getType() == 'select')
			{
				if(value != null && nullCheck(value) == false)
				{
					//temp hack
/*
					if($elem.attr('id') == 'job_subfile_location')
					{
						console.log(value);
						$elem.find('option:contains("Other")').val(value);
					}
*/
					$elem.find('option:contains("Other")').attr('selected', true);
					$elem.siblings('.hide').removeClass('hide').val(value);
				}

			}
			else
			{
				$elem.val(value);
			}
		oneOffFormElemsGet($elem, value);
		}
	});


	//alert(formEl)
	var treeElem = '.litree';
	if(formEl == '.dt_borders_bot_row > td')
	{
		treeElem = '.litree_tasks';
	}
	findtree_openRowSubs(treeElem);


	//calculating the height if any hidden elements were shown this will readjust the height to match
	var totalHeight = 0;
	$(formEl).children().each(function(){
    	totalHeight = totalHeight + $(this).outerHeight();
    });
	$(formEl).parent('div').css({"height":totalHeight+"px"});
}
function formsPopulate(getObj, formEl)
{
	var finalObj = {};
//	console.log(getObj);//console.log(getObj.priority_0);console.log(getObj.priority_1);

	if(getObj.hasOwnProperty('priority_0') == true)
	{
		if(countObjs(getObj.priority_0) > 0)
		{
			jQuery.extend(finalObj, getObj.priority_0);
			delete getObj.priority_0;
			//runFormsPopulate(getObj.priority_0, formEl, true);
		}
	}
	if(getObj.hasOwnProperty('priority_1') == true)
	{
		if(countObjs(getObj.priority_1) > 0)
		{
			jQuery.extend(finalObj, getObj.priority_1);
			delete getObj.priority_1;
			//runFormsPopulate(getObj.priority_1, formEl. false);
		}
	}
	jQuery.extend(finalObj, getObj);
//	console.log('finalObj');
//	console.log(finalObj);
	runFormsPopulate(finalObj, formEl, true);

	return findAllFormElements(formEl);
}
/*
OLD 3.3 UI Functionality
function additionsFormsPopulate(getObj, formEl)
{
	if(getObj.hasOwnProperty('priority_1') == true)
	{
		if(countObjs(getObj.priority_1) > 0)
		{
			runFormsPopulate(getObj.priority_1, formEl. false);
		}
	}
	return findAllFormElements(formEl);
}
*/

//triggers another function where the function name is a hidden variable contained within
//the element being used and is treated initially as a string.
function postManAutoSaver(elem, formElem, formObj, extraParams)
{
	var $elem = elem;

	if(typeof extraParams != 'object'){extraParams = false;}

	var mnu = $elem.data('autosave');
	if(mnu != '' && mnu != null && mnu != undefined)
	{
		typeof window[mnu] === "function" && window[mnu](elem, formElem, formObj, extraParams);
	}
}

//reusable $.post function to save write time, and overall code base size.
function postMan(elem, uri, params, formElem, formObj)
{
	if(elem == '' || elem == null || elem == undefined){alert('Postman: Element Undefined');return false;}
	if(uri == '' || uri == null || uri == undefined){alert('Postman: URL not defined');return false;}
	if(params == '' || params == null || params == undefined){alert('Postman: Parameters not found');return false;}

	$elem = elem;
	$elem.removeClass('err_input');
	var reqAttr = $elem.attr('data-req');
	if(typeof reqAttr !== 'undefined' && reqAttr !== false)
	{
		var tv = $elem.val();
		if((reqAttr == true || reqAttr.toLowerCase() == "true")&&(tv == '' || tv == 'undefined' || tv == undefined || tv == null))
		{
			$elem.addClass('err_input');
			alert('Postman: This is a required field and can not be empty.');
			return false;
		}
	}


	$.post(uri,params,function(d)
	{
		var d = d;//cause this doesn't flow from function(d) down into the setTimeout
		if(d.status == "SUCCESS")
		{
			if($('#'+$elem.attr('name')+'_msgbox').length > 0){$('#'+$elem.attr('name')+'_msgbox').remove();}
			$elem.parent().append('<span class="round_all_four chacia_status_badge zsb_success" id="'+$elem.attr('name')+'_msgbox">SAVED</span>');

			//console.log(params);
			//window[$(formElem).data('form_id')] = findAllFormElements(formElem);
			setTimeout(function()
			{
				$('#'+$elem.attr('name')+'_msgbox').animate({"opacity":"0"}, 2200, function(){$('#'+$elem.attr('name')+'_msgbox').remove();});
			}, 1000);
			if($elem.data('autosave_end') && nullCheck($elem.data('autosave_end')) == false)
			{
				var whichAuto = $elem.data('autosave_end');
				if(whichAuto == 'updateTaskDisplay')
				{
					var $sib = $elem.parents('tr').prev('tr').find('.src_disp');
					typeof window[$elem.data('autosave_end')] === "function" && window[$elem.data('autosave_end')]($elem, $sib, d);
				}
				else
				{
					typeof window[$elem.data('autosave_end')] === "function" && window[$elem.data('autosave_end')](d);
				}
			}
		}
		else
		{
			if(d.code == "1900" || d.code == 1900)
			{
				msgDisplayBoxLogout(d.code, d.message, d.actions);
			}
			else
			{
				msgDisplayBox(d.code, d.message, d.actions);
			}
		}
	}, 'json');
}
//elem & formObj gets passed from the autosave function when it calls this one out.
function postHandler(elem, formElem, formObj, extraParams)
{
	var $elem = elem;
	var uri = $elem.data('autosave_uri');
	var flipSelection = nullCheck($elem.data('flip_selection')) == true ? false : true;
	//console.log($elem.attr('id')+': '+flipSelection);
	var params = {};
	if(nullCheck(uri) == true){return false;}
	if($elem.getType() == 'radio' || $elem.getType() == 'checkbox')
	{
		if($elem.attr('data-flip_selection'))
		{
			endVal = $elem.is(':checked')? 'FALSE' : 'TRUE';
		}
		else
		{
			endVal = $elem.is(':checked')? 'TRUE' : 'FALSE';
		}
		//endVal = oneOffFormElemsPost($elem, endVal);
	}
	else if($elem.getType() == 'select')
	{
		if(nullCheck($('option:selected', $elem).val()) == true)
		{
			endVal = 'NULL';
		}
		else
		{
			if(nullCheck($elem.find('option:selected').val()) == true)
			{
				endVal = 'NULL';
			}
			else
			{
				endVal = $elem.find('option:selected').val();
			}
		}
		//endVal = oneOffFormElemsPost($elem, endVal);
	}
	else
	{
		if(nullCheck($elem.val()) == true)
		{
			endVal = 'NULL';
		}
		else
		{
			endVal = $elem.val();
		}
		//endVal = oneOffFormElemsPost($elem, endVal);
	}

	params.property = oneOffFormElemsPostParam($elem.attr('name'));
	params.value = oneOffFormElemsPost($elem, endVal);//endVal;
	if (typeof system_id !== 'undefined'){params.system_id = system_id;}
	if (typeof current_job_id !== 'undefined'){params.job_id = current_job_id;}

	if(extraParams != false)
	{
		$.each(extraParams, function(i,v)
		{
			params[i] = v;
		});
	}
	postMan(elem, uri, params, formElem, formObj);
}

function oneOffFormElemsPost(elem, currVal)
{
	$elem = elem;
	var endVal = currVal;
	//task_local_copy_location
	if($elem.attr('id') == "specific_element")
	{
		//endVal = overridden with some magic
	}
return endVal;
	//job_vss_snap
}
function oneOffFormElemsPostParam(elemName)
{
	if(elemName == "specific_element")
	{
		//change the property name of the key=>value pair going back
		//example I had a hidden field that was trigged to viewable via select element
		//problem is/was that the select element when not trigging the hidden element to show contained values i needed
		//only when the hidden one was visible did I want to swap it out
		//seeing as this functionality has a one to one mapping with element name and element value when it posts back
		elemName = "specific_element_other";
	}
	return elemName;
}
function oneOffFormElemsGet(elem, currVal)
{
	$elem = elem;
	if(nullCheck(currVal) == true){currVal = null;}
	if($elem.attr('id') == "specific_element")
	{
		if(nullCheck($elem.val()) == false)
		{
			//when getting the data from a DB lets say
			//and we are prepopulating the forms based on that.
			//sometimes we want an acction to occur if the data is or isnt to a specific element
		}
	}
}
//handles the click event of a checkbox/radio thats in a header so the header will react with bold/(open/close) with the state of the checkbox/radio
//works with li tree stuff
$(':input:checkbox, :input:radio').live('click', function(e)
{
	e.stopImmediatePropagation();
	if($(this).attr('data-headcheck'))
	{
		checked_direct = true;
		$(this).parent('.tree_header_trigger').click();
	}
});
