const Note = require('../models/Note')
const User = require('../models/User')
const asyncHandler = require('express-async-handler')

const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean()
    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username }
    }))

    res.json(notesWithUser)
})
const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    const duplicate = await Note.findOne({ title }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }
    const note = await Note.create({ user, title, text })

    if (note) { 
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }

})

const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Vui long dien day du thong tin' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Khong tim thay' })
    }
    const duplicate = await Note.findOne({ title }).lean().exec()

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Tieu de da duoc su dung' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' da cap nhat`)
})
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({ message: 'Can nhap ID' })
    }
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Khong tim thay' })
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title}' co ID ${result._id} da duoc xoa`

    res.json(reply)
})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}