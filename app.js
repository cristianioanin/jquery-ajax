const DataController = (function () {
  class Student {
    constructor(obj) {
      this.id = obj.id;
      this.firstName = obj.firstName;
      this.lastName = obj.lastName;
      this.grades = obj.grades;
    }

    fullName() {
      return `${this.firstName} ${this.lastName}`;
    }

    getAverageScore() {
      const count = Object.values(this.grades).length;
      let sum = 0;
      for (let discipline in this.grades) {
        sum += this.grades[discipline];
      }
      return (sum / count).toFixed(2);
    }
  }

  function createStudent(obj) {
    return new Student(obj);
  }

  return {
    createStudent
  }
})();

const ViewController = (function () {
  function initializeContainer() {
    const container = `
    <div class="container" id="students-list">
      <div class="row">
      </div>
    </div>
  `;
    $('main').append(container);
  }

  function initializeCard(id) {
    const container = $('#students-list .row');
    const card = `
      <div class="col-md-3 text-center">
        <div class="card" data-student="${id}">
          <div class="card-body">

          </div>
        </div>
      </div>`;
    container.append(card);
    return $(`.card[data-student= "${id}"]`).find('.card-body');
  }

  function initializeTable() {
    const container = $('#students-list .row');
    const table = `
    <table class="table table-striped" id="students-table">
      <thead>
      </thead>
      <tbody>
      </tbody>
    </table>`;
    container.append(table);
    return {
      tableHead: $('#students-table thead'),
      tableBody: $('#students-table tbody')
    };
  }

  function renderStudent(student) {
    const studentInfo = `
      <h5 class= "card-title"> ${ student.fullName()}</h5>
      <button class="btn btn-info">Show Grades</button>`;
    return $(studentInfo);
  }

  function renderGrades(student) {
    const card = $(`.card[data-student= "${student.id}"]`).find('.card-body');
    card.find('button').remove();

    const disciplines = Object.keys(student.grades);
    const averageGrade = student.getAverageScore();

    card.parent().attr('data-average', averageGrade);

    const gradesInfo = `
      <ul class="list-group">
        ${disciplines.map(discipline => `<li class="list-group-item">${discipline.toUpperCase()}: ${student.grades[discipline]}</li>`).join('')}
      </ul>`;
    const averageInfo = `
      <div class="card-footer">${averageGrade}</div>
    `;
    card.append(gradesInfo, averageInfo);
  }

  function renderTable(students, averageGradesMap) {
    const container = $('#students-list .row');
    const tableBody = $('#students-table tbody');

    if (container.children().length) {
      return renderStudentToTable(students, tableBody.children().length, averageGradesMap);
    }

    initializeContainer();
    const table = initializeTable();
    const classes = Object.keys(students[0].grades);
    const theadRow = $(`<tr>
      <th scope="col">
        #
      </th>
      <th scope="col">
        Student
      </th>
      ${classes.map(discipline => `
      <th scope="col">
        ${discipline.toUpperCase()}
      </th>
      `).join('')}
    </tr>`);
    table.tableHead.append(theadRow);
    renderStudentToTable(students, tableBody.children().length, averageGradesMap);
  }

  function renderStudentToTable(students, index, averageGradesMap) {
    const tableBody = $('#students-table tbody');
    const student = students[index];
    const row = (student, index) => {
      const grades = Object.values(student.grades);
      return `
      <tr>
        <th scope="row">
          ${++index}
        </th>
        <td>
          ${student.fullName()}
        </td>
        ${grades.map(grade => `
        <td>
          ${grade}
        </td>`).join('')}
      </tr>`
    };
    tableBody.append(row(student, index));
    if (index === 3) {
      renderAverageToTable(averageGradesMap);
    }
  }

  function renderAverageToTable(averageGradesMap) {
    const tableBody = $('#students-table tbody');
    const tableHead = $('#students-table thead');
    const classes = Array.from(tableHead.find('th')).slice(2);
    const disciplines = classes.map(discipline => {
      return discipline.innerText.toLowerCase();
    });
    const row = () => {
      return `
      <tr class="bg-warning">
        <th scope="row">
        </th>
        <td>
          Class Average
        </td>
        ${disciplines.map(discipline => `
        <td>
          ${averageGradesMap.get(discipline)}
        </td>`).join('')}
      </tr>`
    };
    tableBody.append(row);
  }

  function sortStudentCards(order) {
    const unsorted = $('div.card');
    const sorted = unsorted.sort((a, b) => {
      if (order === '0') {
        const compA = $(a).attr('data-student');
        const compB = $(b).attr('data-student');
        return compA - compB;
      } else {
        const compA = $(a).attr('data-average');
        const compB = $(b).attr('data-average');
        return order === '-1' ? compA - compB : compB - compA;
      }
    });

    $.each(sorted, (index, card) => $(card).parent().css('order', String(++index)));
  }

  return {
    initContainer: initializeContainer,
    initCard: initializeCard,
    renderStudentInfo: renderStudent,
    renderStudentGrades: renderGrades,
    sortCards: sortStudentCards,
    showTable: renderTable
  }

})();

const AppController = (function (DataCtrl, ViewCtrl) {
  let studentsList = [];
  const classGrades = new Map();
  const classAverages = new Map();

  function requestStudentsList() {
    studentsList = [];
    $.ajax('students.json', {
      method: 'GET',
      dataType: 'json',
      content: 'application/json'
    }).done(function (data) {
      processStudentsRequest(data);
    });
  }

  function requestStudentGrades(student) {
    $.ajax(`grades-${student.id}.json`, {
      method: 'GET',
      dataType: 'json',
      content: 'application/json',
    }).done(function (result) {
      student.grades = result;
      processStudentGrades(student);
    });
  }

  function requestStudentData() {
    studentsList = [];
    classGrades.clear();
    classAverages.clear();

    $.ajax('students.json', {
      method: 'GET',
      dataType: 'json',
      content: 'application/json'
    }).done(function (data) {
      processDataForTable(data);
    });
  }

  function processStudentsRequest(data) {
    data.forEach(student => studentsList.push(DataCtrl.createStudent(student)));

    $('#students-list').remove();
    ViewCtrl.initContainer();
    studentsList.forEach(student => {
      const card = ViewCtrl.initCard(student.id);
      card.append(ViewCtrl.renderStudentInfo(student));
    });
    attachShowListener();
  }

  function processStudentGrades(student) {
    ViewCtrl.renderStudentGrades(student);
  }

  function processDataForTable(dataSet) {
    $('#students-list').remove();
    dataSet.forEach(student => {
      $.ajax(`grades-${student.id}.json`, {
        method: 'GET',
        dataType: 'json',
        content: 'application/json',
      }).done(function (result) {
        student.grades = result;
        studentsList.push(DataCtrl.createStudent(student));
        collectClassGrades(result);
        processShowTable(studentsList, classGrades);
      });
    });
  }

  function processShowTable(students, classGradesMap) {
    classGradesMap.forEach(function (value, key) {
      classAverages.set(key, (value / students.length).toFixed(2));
    });
    ViewCtrl.showTable(students, classAverages);
  }

  function collectClassGrades(grades) {
    for (let discipline in grades) {
      const totalSoFar = classGrades.get(discipline) || 0;
      classGrades.set(discipline, totalSoFar + grades[discipline]);
    }
  }

  function attachShowListener() {
    $('.card').on('click', 'button', function () {
      const id = $(this).parent().parent().attr('data-student');
      const student = studentsList.filter(student => student.id === id)[0];
      requestStudentGrades(student);
    });
  }

  $('#students-load').on('click', (e) => {
    $('.btn.btn-success').attr('disabled', false);
    requestStudentsList();
  });

  $('#students-sort').on('submit', function (e) {
    e.preventDefault();
    const sorting = $(this).find('option:selected').val();
    ViewCtrl.sortCards(sorting);
  });

  $('#students-table').on('click', (e) => {
    $('.btn.btn-success').attr('disabled', true);
    requestStudentData();
  });

})(DataController, ViewController);