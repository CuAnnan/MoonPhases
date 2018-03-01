'use strict';

let monthNames =['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
	auspices = {'Full Moon':'Rahu', 'Last Quarter':'Elodoth', 'First Quarter':'Elodoth', 'New Moon':'Irraka', 'Gibbous':'Cahalith', 'Crescent':'Ithaeur'},
	phaseSymbols = {'Rahu':'🌕', 'Elodoth':'🌓', 'Irraka':'🌑', 'Ithaeur':'🌒', 'Cahalith':'🌖'},
	mainPhases = {
		'First Quarter':{before:'New Moon', after:'Full Moon', padding: 1},
		'Full Moon':{before:'First Quarter', after:'Last Quarter', padding: 2},
		'Last Quarter':{before:'Full Moon', after:'New Moon', padding: 1},
		'New Moon':{before:'Last Quarter', after:'First Quarter', padding: 2}
	},
	// after each main phase comes the following minor phases,
	minorPhases = {
		'First Quarter':'Gibbous',
		'Full Moon':'Gibbous',
		'Last Quarter':'Crescent',
		'New Moon':'Crescent'
	};

class Calendar
{
	constructor(data)
	{
		data = data ? data : {};
		let nodeId = data.nodeId ? data.nodeId : 'calenderContainer';
		this.node = $(`#${nodeId}`);
		if(!this.node)
		{
			this.node = $('<div/>').attr('id', nodeId).appendTo($('body'));
		}
		this.setDate(new Date());
	}
	
	getPreviousMonth()
	{
		this.setDate(new Date(this.date.getFullYear(), this.date.getMonth() - 1));
	}
	
	getNextMonth()
	{
		this.setDate(new Date(this.date.getFullYear(), this.date.getMonth() + 1));
	}
	
	setDate(date)
	{
		this.date = date;
		this.getLunarData().then(this.render.bind(this))
	}
	
	render(moonPhases)
	{
		let {firstDate, lastDate} = this.getFirstAndLastDaysOfMonth(this.date),
			firstDay = dayNames[firstDate.getDay()],
			lastDay = dayNames[lastDate.getDay()],
			$calendarNode = $('<table/>').addClass('forsaken_calendar_table'),
			$thead = $('<thead/>').appendTo($calendarNode),
			$topUI = $('<tr/>').appendTo($thead),
			$daysNode = $('<tr/>').addClass('calendarDayNames').appendTo($thead),
			$calendarBody = $('<tbody/>').appendTo($calendarNode);
		
		this.addNextAndLastMonthUI($topUI);
		
		for(let day of dayNames)
		{
			$daysNode.append($('<th/>').text(day));
		}
		
		let $currentRow = $('<tr/>').appendTo($calendarBody);
		for(let i = 0; i < firstDate.getDay(); i++)
		{
			$currentRow.append($('<td/>').html('&nbsp;').addClass('notThisMonth'));
		}
		
		for(let i = 0; i < lastDate.getDate(); i++)
		{
			let day = (firstDate.getDay() + i) % 7;
			if(!day)
			{
				$currentRow = $('<tr/>').appendTo($calendarBody);
			}
			let $td = $(`<td><span class="forsaken_calendar_dateHolder">${i+1}</span></td>`).appendTo($currentRow);
			
			
			let index =moonPhases.days.indexOf(i);
			if(index >= 0)
			{
				let phase = moonPhases.phases[index];
				$td.append(
					$(`<span class="forsaken_calendar_phase">${phase.phase}</span><span class="forsaken_calendar_time">(${phase.time})</span>`)
				);
			}
			
			
			let padded = moonPhases.padded[i],
				paddedPhase = moonPhases.padded[padded.phase],
				auspice = auspices[padded.phase];
			
			$td.append($('<div/>').addClass('forsaken_calendar_moon forsaken_calendar_'+auspice.toLowerCase()));
		}
		
		for(let i = lastDate.getDay(); i< 6; i++)
		{
			$currentRow.append($('<td/>').html('&nbsp;').addClass('notThisMonth'));
		}
		
		let $tfoot = $('<tfoot>').appendTo($calendarNode);
		let $tr = $('<tr/>').appendTo($tfoot);
		this.addNextAndLastMonthUI($tr);
		
		this.node.empty().append($calendarNode);
	}
	
	addNextAndLastMonthUI($tr)
	{
		$tr.addClass('forsaken_calendar_month_chooser');
		let lastMonth = new Date(this.date.getFullYear(), this.date.getMonth() - 1);
		let nextMonth = new Date(this.date.getFullYear(), this.date.getMonth() + 1);
		
		$('<th/>').append(
			$('<a href="#"/>').click((evt)=>{
				evt.preventDefault();
				this.getPreviousMonth();
			}).text(`<- ${monthNames[lastMonth.getMonth()]}`)
		).appendTo($tr);
		$('<th colspan="5"/>').html(`Phases for ${monthNames[this.date.getMonth()]} ${this.date.getFullYear()}`).appendTo($tr);
		
		$('<th/>').append(
			$('<a href="#"/>').click((evt)=>{
				evt.preventDefault();
				this.getNextMonth();
			}).text(`${monthNames[nextMonth.getMonth()]} ->`)
		).appendTo($tr);
	}
	
	getFirstAndLastDaysOfMonth(date)
	{
		return {
			firstDate:new Date(date.getFullYear(), date.getMonth(), 1),
			lastDate:new Date(date.getFullYear(), date.getMonth() + 1, 0)
		};
	}
	
	async getLunarData()
	{
		let monthName = monthNames[this.date.getMonth()],
			data = await $.get('/getLunarData', {
				year:this.date.getFullYear(),
				month:monthName
			}),
			response = {
				days:[],
				phases:[]
			};
		
		for(let phase of data.months[0].phases)
		{
			let indexedDay = phase.day - 1;
			
			// javascript date object days are 0 indexed. Need to offset the nasa data by -1
			response.days.push(phase.day-1);
			response.phases.push(phase);
		}
		
		response.padded = this.padPhases(data);
		
		return response;
	}
	
	padPhases(data)
	{
		let {firstDate, lastDate} = this.getFirstAndLastDaysOfMonth(this.date);
		let lastDay = lastDate.getDate();
		let paddedPhases = [];
		let phaseData = data.months[0].phases;
		let lastDayOfPreviousMonth = new Date(this.date.getFullYear(), this.date.getMonth(), -1).getDate();
		
		// first layer of padding, just add the present main phases to the days that pad before and after them
		for(let date of phaseData)
		{
			let day = parseInt(date.day) - 1,
				padding = mainPhases[date.phase].padding,
				shallowClone = {phase:date.phase},
				bottomBound = Math.max(0, day - padding),
				upperBound = Math.min(lastDay, day + padding);
			
			for(let i = bottomBound; i <= upperBound; i++)
			{
				paddedPhases[i] = shallowClone;
			}
		}
		
		// do the padding at the edges of the calendar if needed
		let beforePadding = (parseInt(data.previous.day) - 1) + mainPhases[data.previous.phase].padding - lastDayOfPreviousMonth;
		if(beforePadding > 0)
		{
			for(let i = 0; i < beforePadding; i++)
			{
				paddedPhases[i] = {phase:data.previous.phase};
			}
		}
		
		let afterPadding = (parseInt(data.next.day) - 1) - mainPhases[data.previous.phase].padding;
		if(afterPadding < 0)
		{
			afterPadding = Math.abs(afterPadding);
			for (let i = 0; i < afterPadding; i++)
			{
				paddedPhases[(lastDay - i) - 1] = {phase:data.next.phase};
			}
		}
		let previousPhase = data.previous;
		
		for(let i = 0; i < lastDay; i++)
		{
			if(!paddedPhases[i])
			{
				paddedPhases[i] = {
					'phase':minorPhases[previousPhase.phase]
				};
			}
			else
			{
				previousPhase = paddedPhases[i];
			}
		}
		
		return paddedPhases;
	}
}