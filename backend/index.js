const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 우리가 새로 만든 모델 파일을 불러옵니다.
const Todo = require('./models/Todo');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// MongoDB 연결 (개인 정보는 .env 파일에서 관리)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB 연결 성공'))
    .catch(err => console.error('MongoDB 연결 실패:', err));

// --- API 엔드포인트 ---

// 1. 할 일 목록 가져오기 (최신순 정렬)
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. 할 일 추가 (전체 body를 저장하여 새로운 필드들 반영)
app.post('/api/todos', async (req, res) => {
    try {
        const newTodo = new Todo(req.body);
        await newTodo.save();
        res.json(newTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. 할 일 수정 (체크박스, 중요 별표 표시 등)
app.put('/api/todos/:id', async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. 할 일 삭제
app.delete('/api/todos/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.json({ message: '삭제 완료' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 로컬 테스트용 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));

module.exports = app;