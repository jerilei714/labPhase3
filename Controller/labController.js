const express = require('express');
const { createLab, getLab, updateLab, deleteLab, getLabNamesAndIds, getLabByName } = require('../Model/laboratory');
const { ObjectId } = require('mongodb');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { lab_name, total_seats, location } = req.body;
        const laboratory = {
            lab_name,
            total_seats,
            location
        };
        const laboratoryId = await createLab(laboratory);
        res.status(201).json({ laboratoryId });
    } catch (error) {
        console.error('Error creating laboratory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:labId', async (req, res) => {
    try {
        const { labId } = req.params;
        if (!/^[0-9a-fA-F]{24}$/.test(labId)) {
            return res.status(400).json({ error: 'Invalid labId format' });
        }
        const lab = await getLab(new ObjectId(labId));
        if (lab) {
            res.json(lab);
        } else {
            res.status(404).json({ error: 'Lab not found' });
        }
    } catch (error) {
        console.error('Error getting lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/:labId', async (req, res) => {
    try {
        const { labId } = req.params;
        const updatedLabData = req.body;
        const success = await updateLab(new ObjectId(labId), updatedLabData);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Lab not found' });
        }
    } catch (error) {
        console.error('Error updating lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/names/labNames', async (req, res) => {
    try {
        
        const labs = await getLabNamesAndIds();
        res.json(labs);
    } catch (error) {
        console.error('Error fetching lab names:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/name/:labName', async (req, res) => {
    const { labName } = req.params;
    try {
        const lab = await getLabByName(labName);
        if (lab) {
            res.json({ total_seats: lab.total_seats });
        } else {
            res.status(404).json({ error: 'Lab not found' });
        }
    } catch (error) {
        console.error('Error getting lab by name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:labId', async (req, res) => {
    try {
        const { labId } = req.params;
        const success = await deleteLab(new ObjectId(labId));
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Lab not found' });
        }
    } catch (error) {
        console.error('Error deleting lab:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:labName', async (req, res) => {
    try {
        const { labName } = req.params;
        console.log('Lab name received:', labName); 
        const lab = await getLabByName(labName);
        if (lab) {
            console.log('Lab found:', lab); 
            res.json(lab);
        } else {
            console.log('Lab not found'); 
            res.status(404).json({ error: 'Lab not found' });
        }
    } catch (error) {
        console.error('Error getting lab by name:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
