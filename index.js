const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();
app.use(express.json());
app.use(express.static('build'));

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      JSON.stringify(req.body),
    ].join(' ');
  })
);

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson.toJSON());
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;

  if (body === undefined) {
    return response.status(400).json({
      error: 'content missing',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((newPerson) => newPerson.toJSON())
    .then((newFormattedPerson) => {
      response.json(newFormattedPerson);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person.toJSON());
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons.map((person) => person.toJSON()));
  });
});

app.get('/info/', (request, response) => {
  const time = Date();
  Person.find({}).then((persons) => {
    response.send(
      `
    <div>
      <p>Phonebook has info for ${persons.length} people</p>
    </div>
    <div>
      <p>${time}</p>
    </div>
    `
    );
  });
});

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
