const express = require('express')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const path = require('path')
const xss = require('xss')

const xssCleanUpNote = (note) => {
    const cleanedUpNote= { 
        "id": note.id,
        "note_name": xss(note.note_name),
        "modified": xss(note.modified),
        "content": xss(note.content),
        "folder_id": note.folder_id
    }
    
    return cleanedUpNote
}

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(
            req.app.get('db')
        )
        .then(notes => {
            const cleanedUpNotes = notes.map(note => {
                return xssCleanUpNote(note)
            })

            res.json(cleanedUpNotes)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { id, note_name, modified, content, folder_id } = req.body
        const newNote = { note_name, content, folder_id }
    
        // loop through keys and values of passed in values to check the required items are there
        for (const [key, value] of Object.entries(newNote)) {
                if (value == null) {
                    return res.status(400).json({
                        error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        newNote.id = id; // TODO: would be good to check if provided ID is a GUID
        newNote.modified = modified; // and if sent modified date is a legit timestamp
                
        const cleanedUpNote = xssCleanUpNote(newNote)
        
        NotesService.insertNote(    
            req.app.get('db'),
            cleanedUpNote
        )
        .then(note => {
            
        res
            .status(201)
            .location(path.posix.join(req.originalUrl,`/${note.id}`))
            .json(note)
        })
        .catch(next)
    })

notesRouter
    .route('/:note_id')
    // all is what always happens, whether for get or patch
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getById(knexInstance, req.params.note_id)

        .then(note => {
            if (!note) {
                return res.status(404).json({
                    error: { message: `Note doesn't exist` }
                })
            }
            res.note = note // save the note for the next middleware
            next() // called next so the next middleware happens!
        })
        .catch(next)
    })
    .get((req, res, next) => {
       
        const cleanedUpNote = xssCleanUpNote(res.note)

        res.json({
            ...cleanedUpNote
        })
    })
    .patch(jsonParser, (req, res, next) => {
        const { id, note_name, modified, content, folder_id } = req.body
        const updatedNote = { note_name, content, folder_id }

        const numberOfValues = Object.values(updatedNote).filter(Boolean).length
        
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain at least one of 'note_name', 'content', or 'folder_id'`
                }
            })
        }

        res.status(204).end()
        
        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            updatedNote
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = notesRouter