const express = require("express");
const app = express();
app.use(express.json())
const morgan = require('morgan')


let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))

app.post('/api/persons', (request, response) => {
  const person = request.body
  if (person.name.length === 0 || person.number.length === 0) {
    return response.status(400).json({
      error: 'content missing'
    })
  } 
  if (persons.find(x => x.name === person.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }
  persons.push({
    name: person.name,
    number: person.number,
    id: Math.floor(Math.random() * 500000)
  })
  response.json(persons)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(x => x.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info/", (request, response) => {
  const time = Date();
  response.send(
    `
    <div>
      <p>Phonebook has info for ${persons.length} people</p>
    </div>
    <div>
      <p>${time}</p>
    </div>
    `);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
