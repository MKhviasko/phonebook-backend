const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://LomDB:${password}@cluster0.ggp5ocz.mongodb.net/phonebook?retryWrites=true&w=majority&ssl=true`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// const personTest = new Person({
//   name: 'Monika',
//   number: '123',
// })

// personTest.save().then(result => {
//   console.log('persdon saved!')
// })

Person.find({}).then(result => {
    result.forEach(person => {
        console.log(person)
    })
    mongoose.connection.close()
})