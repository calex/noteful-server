
const FoldersService = {
    getAllFolders(knex) {
        return knex.select('*').from('folders')
    },
    insertFolder(knex, newFolder) {
        return knex
        .insert(newFolder)
        .into('folders')
        .returning('*') //built in knex method to return all of the item that was just inserted
        .then(rows => {
            return rows[0] // pull object out of array that is returned
        })
    },
    getById(knex, id) {
        return knex.from('folders').select('*').where('id', id).first()
    },
    updateFolder(knex, id, updatedFolder) {
        return knex('folders')
        .where({ id })
        .update(updatedFolder)
    },
    deleteFolder(knex, id) {
        return knex('folders')
        .where({ id })
        .delete()
    }
}

module.exports = FoldersService