const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://eetutorri33:${password}@cluster0.uz3xsaz.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    required: true,
  },
})
const Person = mongoose.model('people', personSchema)

if (!process.argv[3]) {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else {
  const people = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })
  people.save().then(() => {
    console.log('person saved!')
    mongoose.connection.close()
  })
}
