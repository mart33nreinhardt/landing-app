const navItems = document.querySelectorAll('nav ul li');
const sections = document.querySelectorAll('section')
const hamburger = document.querySelector('.btn-hamburger')
const navMenu = document.querySelector('nav ul')

const changeActiveNav = (id) => {
    navItems.forEach(li => {
        li.classList.remove('active')

        if(li.querySelector('a').getAttribute('href') === `#${id}`){
            li.classList.add('active')
        }
    })
}

const options = {
    threshold: 0.6
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            changeActiveNav(entry.target.id)
        }
    })
}, options)

sections.forEach(section => observer.observe(section))

navItems.forEach(item => {
    item.addEventListener('click', function(){
        navItems.forEach(li => li.classList.remove('active'))
        this.classList.add('active')
    })
})

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('show')
})