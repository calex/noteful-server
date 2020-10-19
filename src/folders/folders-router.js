const express = require('express')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const path = require('path')
const xss = require('xss')

const xssCleanUpFolder = (folder) => {
    const cleanedUpFolder = { 
        "id": folder.id,
        "folder_name": xss(folder.folder_name),
        "date_created": xss(folder.date_created)
    }
    
    return cleanedUpFolder
}

foldersRouter
    .route('/')
    .get((req, res, next) => {
        FoldersService.getAllFolders(
            req.app.get('db')
        )
        .then(folders => {
            const cleanedUpFolders = folders.map(folder => {
                return xssCleanUpFolder(folder)
            })

            res.json(cleanedUpFolders)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { id, folder_name, date_created } = req.body
        const newFolder = { folder_name }
    
        // loop through keys and values of passed in values to check the required items are there
        for (const [key, value] of Object.entries(newFolder)) {
                if (value == null) {
                    return res.status(400).json({
                        error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        newFolder.id = id;
        newFolder.date_created = date_created;
                
        const cleanedUpFolder = xssCleanUpFolder(newFolder)
        
        FoldersService.insertFolder(    
            req.app.get('db'),
            cleanedUpFolder
        )
        .then(folder => {    
            res
                .status(201)
                .location(path.posix.join(req.originalUrl,`/${folder.id}`))
                .json(folder)
            })
        .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    // all is what always happens, whether for get or patch
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getById(knexInstance, req.params.folder_id)

        .then(folder => {
            if (!folder) {
                return res.status(404).json({
                    error: { message: `Folder doesn't exist` }
                })
            }
            res.folder = folder // save the folder for the next middleware
            next() // called next so the next middleware happens!
        })
        .catch(next)
    })
    .get((req, res, next) => {
       
        const cleanedUpFolder = xssCleanUpFolder(res.folder)

        res.json({
            ...cleanedUpFolder
        })
    })
    .patch(jsonParser, (req, res, next) => {
        const { id, folder_name, date_created } = req.body
        const updatedFolder = { folder_name }
        
        if (!updatedFolder.folder_name.length) {
            return res.status(400).json({
                error: {
                    message: `Request body must have a 'folder_name' to update`
                }
            })
        }

        res.status(204).end()
        
        FoldersService.updateFolder(
            req.app.get('db'),
            req.params.folder_id,
            updatedFolder
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    .delete((req, res, next) => {
        FoldersService.deleteFolder(
            req.app.get('db'),
            req.params.folder_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = foldersRouter