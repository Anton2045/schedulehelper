

const CreateMessageHTML =(cell)=> {
    let message_html = `
                             <strong>${cell.number_lesson}</strong>
<strong>${cell.date}</strong>

<b>${cell.name}</b>

аудитория: ${cell.auditorium}
группа: ${cell.group}
преподователь: ${cell.lecture}

<a >${cell.href}</a>
<i>актуальность: ${cell.create_date}</i>
-----------------------------------------------------------------------
`
    return message_html
}

module.exports = CreateMessageHTML