const list = [
    ['edwinm.leonb@gmail.com', 'FT19B'],
    ['jhoanburbano@unicauca.edu.co', 'FT19A']
]

const checkList = (email)=>{
    let ret = null
    list.forEach(e=>{
        if(e[0].toLowerCase() === email.toLowerCase()){
            ret = e[1]
        }else{
            ret = false;
        }
    })
    return 'FT19B'
}
module.exports = {
    checkList
}