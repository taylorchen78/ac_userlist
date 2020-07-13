const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users'

const user_data = []

const user_data_panel = document.getElementById('data-panel')
const searchType = document.getElementById('search-type')
const searchForm = document.getElementById('search')
const searchInput = document.getElementById('search-input')
const pagination = document.getElementById('pagination')
const genderFilter = document.getElementById('genderfilter')

const USER_PER_PAGE = 8
const PAGE_PER_ROW = 10

const SEARCH_BY_NAME = 1
const SEARCH_BY_AGE = 2
const SEARCH_BY_REGION = 3

const GENDER_ALL = 1
const GENDER_MALE = 2
const GENDER_FEMALE = 3

let paginationData = []
let paginationDataByGender = []

let totalPage = 1
let currentPage = 1

let search_type = SEARCH_BY_NAME
let currentGender = GENDER_ALL

// initial: get whole user data
axios.get(INDEX_URL).then((response => {
  user_data.push(...response.data.results)
  totalPage = Math.ceil(user_data.length / USER_PER_PAGE) || 1
  drawPagination(currentPage)
  getPageData(currentPage, user_data)
})).catch(err => console.log(err))

user_data_panel.addEventListener('click', (event => {
  if (event.target.matches('.card-avatar')) {
    console.log(event.target)
    showCurrentUserData(event.target.dataset.id)
  }
}))

searchType.addEventListener('click', (event => {
  if (event.target.matches('.select-search-type')) {
    search_type = Number(event.target.value)
  }
}))

searchForm.addEventListener('submit', (event => {
  event.preventDefault()
  let input = searchInput.value.toLowerCase()
  let results = ''

  if (search_type === SEARCH_BY_NAME) {
    results = user_data.filter(
      user => user.name.toLowerCase().includes(input)
    )
  } else if (search_type === SEARCH_BY_AGE) {
    if (input !== '') {
      results = user_data.filter(
        user => user.age === Number(input)
      )
    } else {
      results = user_data
    }
  } else if (search_type === SEARCH_BY_REGION) {
    results = user_data.filter(
      user => user.region.toLowerCase().includes(input)
    )
  }

  currentPage = 1
  totalPage = Math.ceil(results.length / USER_PER_PAGE) || 1

  drawPagination(currentPage)
  getPageData(currentPage, results)
}))

genderFilter.addEventListener('click', (event => {
  if (event.target.matches('.btn-gender-male')) {
    paginationDataByGender = paginationData.filter(
      user => user.gender === 'male'
    )
    totalPage = Math.ceil(paginationDataByGender.length / USER_PER_PAGE) || 1
    currentPage = 1
    currentGender = GENDER_MALE
    drawPagination(currentPage)
    getPageDataByGender(currentPage, paginationDataByGender)
  } else if (event.target.matches('.btn-gender-female')) {
    paginationDataByGender = paginationData.filter(
      user => user.gender === 'female'
    )
    currentPage = 1
    currentGender = GENDER_FEMALE
    totalPage = Math.ceil(paginationDataByGender.length / USER_PER_PAGE) || 1
    drawPagination(currentPage)
    getPageDataByGender(currentPage, paginationDataByGender)
  } else {
    totalPage = Math.ceil(paginationData.length / USER_PER_PAGE) || 1
    currentPage = 1
    currentGender = GENDER_ALL
    drawPagination(currentPage)
    getPageData(currentPage, paginationData)
  }
  console.log("genderFilter: " + currentGender)
}))

pagination.addEventListener('click', (event => {
  if (event.target.getAttribute("data-page-category") !== null) {
    if (event.target.dataset.pageCategory === "next") {
      currentPage = Math.ceil(currentPage / PAGE_PER_ROW) * PAGE_PER_ROW + 1
    } else if (event.target.dataset.pageCategory === "pre") {
      currentPage = (Math.floor((currentPage / PAGE_PER_ROW) - 1) * PAGE_PER_ROW) + 1
    } else {
      currentPage = Number(event.target.dataset.pageCategory)
    }
    drawPagination(currentPage)
    console.log("pagination: " + currentGender)
    if (currentGender === GENDER_ALL) {
      getPageData(currentPage)
    } else {
      getPageDataByGender(currentPage, paginationDataByGender)
    }
  }
}))

function displayUserData(user_data) {
  let htmlContent = ''
  user_data.forEach(item => {
    htmlContent += `
      <div class="col-sm-3">
        <div class="card mb-2">
          <img src="${item.avatar}" class="card-avatar" alt="Avatar" data-id="${item.id}" data-toggle="modal" data-target="#show-card-modal" width=100%>
          <div class="card-body">
            <h6 class="card-name" style="text-align:center" data-id="${item.id}">${item.name} ${item.surname}</h6>
          </div>
        </div>
      </div>
    `
  })
  user_data_panel.innerHTML = htmlContent
}

function drawPagination(page) {
  let htmlContent = ''
  let start = Math.floor((page - 1) / PAGE_PER_ROW) * PAGE_PER_ROW + 1
  let end = Math.ceil(page / PAGE_PER_ROW) * PAGE_PER_ROW

  if (end > totalPage) {
    end = totalPage
  }

  // draw previous button
  if (start === 1 || totalPage === 1) {
    htmlContent += `
      <li class="page-item disabled">
        <a class="page-link" href="javascript:;" data-page-category="pre">Previous</a>
      </li>
    `
  } else {
    htmlContent += `
      <li class="page-item">
        <a class="page-link" href="javascript:;" data-page-category="pre">Previous</a>
      </li>
    `
  }

  //draw page number button
  for (let i = start; i <= end; i++) {
    if (i === page) {
      htmlContent += `
        <li class="page-item active"><a class="page-link" href="javascript:;" data-page-category="${i}">${i}</a></li>
      `
    } else {
      htmlContent += `
        <li class="page-item"><a class="page-link" href="javascript:;" data-page-category="${i}">${i}</a></li>
      `
    }
  }

  //draw page number button
  if (end === totalPage || totalPage === 1) {
    htmlContent += `
      <li class="page-item disabled">
        <a class="page-link" href="javascript:;" data-page-category="next">Next</a>
      </li>
    `
  } else {
    htmlContent += `
      <li class="page-item">
        <a class="page-link" href="javascript:;" data-page-category="next">Next</a>
      </li>
    `
  }

  pagination.innerHTML = htmlContent
}

function getPageData(pageNum, data) {
  paginationData = data || paginationData
  let offset = (pageNum - 1) * USER_PER_PAGE
  let pageData = paginationData.slice(offset, offset + USER_PER_PAGE)
  displayUserData(pageData)
}

function getPageDataByGender(pageNum, data) {
  paginationDataByGender = data || paginationDataByGender
  let offset = (pageNum - 1) * USER_PER_PAGE
  let pageData = paginationDataByGender.slice(offset, offset + USER_PER_PAGE)
  displayUserData(pageData)
}

function showCurrentUserData(user_id) {
  const url = INDEX_URL + '/' + user_id
  const card_name = document.querySelector('.modal-title')
  const card_avatar = document.getElementById('show-card-avatar')
  const card_email = document.getElementById('show-card-email')
  const card_region = document.getElementById('show-card-region')
  const card_birthday = document.getElementById('show-card-birthday')

  axios.get(url).then((response => {
    const data = response.data
    const name = data.name + ' ' + data.surname

    if (data.gender === 'male') {
      card_name.innerHTML = `
        <i class="fa fa-mars fa-lg" aria-hidden="true"></i>
        <span>${data.name} ${data.surname}</span>
      `
    } else {
      card_name.innerHTML = `
        <i class="fa fa-venus fa-lg" aria-hidden="true"></i>
        <span>${data.name} ${data.surname}</span>
      `
    }

    card_avatar.innerHTML = `<img src="${data.avatar}" class="modal-card-avatar" alt="Avatar" width=100%>`

    card_email.innerHTML = `
      <i class="fa fa-envelope-o" aria-hidden="true"></i>
      <span>${data.email}</span>
    `
    card_region.innerHTML = `
      <i class="fa fa-globe" aria-hidden="true"></i>
      <span>${data.region}</span>
    `

    card_birthday.innerHTML = `
      <i class="fa fa-birthday-cake" aria-hidden="true"></i>
      <span>${data.birthday} (${data.age})</span>
    `

  })).catch(err => console.log(err))

}




