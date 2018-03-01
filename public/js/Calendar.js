'use strict';

let monthNames =['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
	auspices = {'Full Moon':'Rahu', 'Last Quarter':'Elodoth', 'First Quarter':'Elodoth', 'New Moon':'Irraka', 'Gibbous':'Cahalith', 'Crescent':'Ithaeur'},
	phaseSymbols = {'Rahu':'🌕', 'Elodoth':'🌓', 'Irraka':'🌑', 'Ithaeur':'🌒', 'Cahalith':'🌖'};

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
			$daysNode = $('<tr/>').addClass('calendarDayNames').appendTo($('<thead/>').appendTo($calendarNode)),
			$calendarBody = $('<tbody/>').appendTo($calendarNode);
		
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
			
			$td.addClass(auspice);
			$td.append($(`<div class="moonPhase">${phaseSymbols[auspice]}</div>`));
		}
		
		for(let i = lastDate.getDay(); i< 6; i++)
		{
			$currentRow.append($('<td/>').html('&nbsp;').addClass('notThisMonth'));
		}
		
		this.node.empty().append($calendarNode);
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
				phases:[],
				padded:null
			},
			{firstDate, lastDate} = this.getFirstAndLastDaysOfMonth(this.date),
			lastDay = lastDate.getDate(),
			paddedData = [],
			padPhase = (day, phase, extraDay)=>{
				paddedData[day] = phase;
				if(day > 0)
				{
					paddedData[day - 1] = phase;
					if(extraDay && day > 1)
					{
						paddedData[day - 2] = phase;
					}
				}
				if(day < lastDay)
				{
					paddedData[day + 1] = phase;
					if(extraDay && day < lastDay - 1)
					{
						paddedData[day + 2] = phase;
					}
				}
				
				if(extraDay)
				{
					let missingPhase = (phase.phase == 'Full Moon'?'Gibbous':'Crescent');
					for(let i = 3; i < 6; i++)
					{
						if(day > i)
						{
							paddedData[day - i] = {phase:missingPhase};
						}
						if(day < (lastDay - (i)))
						{
							paddedData[day + i] = {phase:missingPhase};
						}
					}
				}
			};
		
		for(let phase of data.results[0].phases)
		{
			let indexedDay = phase.day - 1;
			
			padPhase(indexedDay, {phase:phase.phase}, phase.phase == 'Full Moon' || phase.phase == 'New Moon');
			
			// javascript date object days are 0 indexed. Need to offset the nasa data by -1
			response.days.push(phase.day-1);
			response.phases.push(phase);
		}
		for(let i = 0; i < lastDate.getDate(); i++)
		{
			if(!paddedData[i])
			{
				if(i > 0)
				{
					paddedData[i] = paddedData[i - 1];
				}
				else
				{
					paddedData[i] = paddedData[i + 1];
				}
			}
		}
		
		response.padded = paddedData;
		
		return response;
		
	}
}