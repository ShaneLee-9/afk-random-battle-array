const heroes = document.getElementById('heroes')
const friends = document.getElementById('friends')
const essential = document.getElementById('essential')
const essentialError = document.getElementById('essentialError')
const canUseFriends = document.getElementById('can')
const TOTAL = 5
const allErrorEls = document.querySelectorAll('.error-text')
const resultEl = document.querySelector('.result')
const countEl = document.querySelector('.count')

let first = true
let count = 0;

;(function () {
  const formData = JSON.parse(localStorage.getItem('formData')) || null

  if (formData) {
    heroes.value = formData.heroes
    friends.value = formData.friends
    essential.value = formData.essential
    canUseFriends.checked = formData.can
  }
})()

;function str2Arr(str) {
  if (str.includes(',')) {
    return str.split(',').map(cur => +cur)
  } else if (str.includes('-')) {
    const [start, end] = str.split('-')
    const arr = []

    for (let i = start; i <= end; i++) {
      arr.push(+i)
    }

    return arr
  }

  return str ? [+str] : []
}

function count2Arr(count) {
  return [...Array(+count)].map((c, i) => i + 1)
}

// Validate the form
function checkForm({ friends, can, essential }) {
  // If can't use the friend hero, check whether it is in essential list
  if (friends && !can && essential) {
    const findHero = str2Arr(essential).find(cur => cur <= friends)
    if (findHero) {
      essentialError.innerText = `The hero ${findHero} cannot be used`
      essentialError.classList.add('show')
      return false
    }
  }

  allErrorEls.forEach(cur => {
    cur.innerText = ''
    cur.classList.remove('show')
  })
}

/**
 * Render result
 * @description Convert the result list to HTML, and render it to the page
 * @param {Array} result
 */
function renderResult(result) {
  if (first) {
    document.querySelector('.footer').style.display = 'block'
    first = false
  }

  let str = result.reduce((total, cur, index) => {
    total += `<span class="result-item">${cur}${index < result.length - 1 ? ', ' : ''}</span>`
    return total
  }, '')

  resultEl.innerHTML = str

  anime({
    targets: '.result-item',
    translateX: [-200, 0],
    delay: anime.stagger(100, { from: 'center' })
  })

  countEl.innerHTML = `<span>Count: ${++count}</span>`
}

function handleSubmit() {
  const formData = {
    heroes: heroes.value,
    friends: friends.value,
    can: canUseFriends.checked,
    essential: essential.value
  }

  if (formData.heroes) {
    localStorage.setItem('formData', JSON.stringify(formData))
  } else {
    alert('Heroes is required!')
    return
  }

  if (checkForm(formData) === false) return

  let result // 结果集合
  const isCanUseFriend = canUseFriends.checked

  const heroList = count2Arr(heroes.value).slice(friends.value)
  const essentialList = str2Arr(essential.value)

  /**
   * 获取friend
   */
  let friend
  if (essentialList.length) {
    const friendInEssentl = essentialList.find(cur => cur <= friends.value)
    if (friendInEssentl) {
      friend = friendInEssentl
    } else {
      friend = isCanUseFriend ? _.random(1, friends.value) : ''
    }
  }

  const allHeroes = _.compact([friend, ...heroList])

  if (essentialList.length) {
    // 去除与必要数组对应的元素
    const trimArr = _.difference(allHeroes, essentialList)
    // 从整理后的数组随机获取一个集合
    const sampleList = _.sampleSize(trimArr, TOTAL - essentialList.length)

    result = _.shuffle([...sampleList, ...essentialList])
  } else {
    result = _.sampleSize(allHeroes, TOTAL)
  }


  renderResult(result)
}

function resetCount() {
  count = 0
  countEl.innerHTML = `<span>Count: 0</span>`
}
