const mongoose = require('mongoose');

// 데이터베이스 설계도
const TodoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    isImportant: { type: Boolean, default: false }, // 별표 표시 여부
    isToday: { type: Boolean, default: false },     // 오늘 할 일 탭용
    dueDate: { type: Date, default: null },          // 마감 기한
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Todo', TodoSchema);