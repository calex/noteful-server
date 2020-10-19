
const NotesService = {
    getAllNotes(knex) {
        return knex.select('*').from('notes')
    },
    insertNote(knex, newNote) {
        return knex
        .insert(newNote)
        .into('notes')
        .returning('*') //built in knex method to return all of the item that was just inserted
        .then(rows => {
            return rows[0] // pull object out of array that is returned
        })
    },
    getById(knex, id) {
        return knex.from('notes').select('*').where('id', id).first()
    },
    updateNote(knex, id, updatedNote) {
        return knex('notes')
        .where({ id })
        .update(updatedNote)
    },
    deleteNote(knex, id) {
        return knex('notes')
        .where({ id })
        .delete()
    }
}

module.exports = NotesService