require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (req, res) => JSON.stringify(req.body));
const customLogFormat = ':method :url :status :response-time ms - :body';
app.use(morgan(customLogFormat));

app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        response.json(result)
    })
})

app.get('/info', (request, response) => {
    const currentDate = new Date().toLocaleString()
    const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    response.send(
        `<div>
        <p>Phonebook haas info about people</p>
        </div>
        
        <div>
        <p>${currentDate} (${currentTimeZone})</p>
       </div>`)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(result => {
        if (result) {
            response.json(result)
        } else {
            response.status(404).end()
        }

    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        number: body.number,
        name: body.name
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }

    Person.findOne({ name: body.name }).then(existingPerson => {
        if (existingPerson) {
            existingPerson.number = body.number;

            existingPerson.save()
                .then(updatedPerson => {
                    response.json(updatedPerson);
                })
                .catch(error => next(error));
        } else {
            const person = new Person({
                name: body.name,
                number: body.number
            });

            person.save()
                .then(result => {
                    response.json(result);
                })
                .catch(error => next(error));
        }
    });
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})