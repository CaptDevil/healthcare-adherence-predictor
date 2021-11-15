const express = require('express')
const mongodb = require('mongodb')

let app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

let dbo

mongodb.MongoClient.connect('mongodb+srv://prabhu:bMqWYB7VAOu9BGma@cluster0.8o6bc.mongodb.net/healthcare?retryWrites=true&w=majority', (err,db) => {
    if(err)
        throw err
    dbo = db.db('healthcare')
    console.log('MongoDB connected...')
})

app.get('/',(req,res) => {
    res.send('Greetings, people of earth!!!')
})

app.post('/getdata',(req,res) => {
    let {name, dob, race, ethnicity, gender, county, disease} = req.body
    let patients = []
    let i
    console.log(name, dob, race, ethnicity, gender, county, disease)
    dbo.collection('conditions').find({ DESCRIPTION: disease, STOP: null }).toArray((err,results) => {
        if(err)
            throw err
        for(i=0;i<results.length;i++){
            if(patients.indexOf(results[i].PATIENT) === -1)
                patients.push(results[i].PATIENT)
        }
        console.log(patients.length)
        if(patients.length !== 0){
            dbo.collection('patients').find({ Id: {$in: patients}, RACE: race, ETHNICITY: ethnicity, GENDER: gender, COUNTY: county }).toArray((err,results) => {
                if(err)
                    throw err
                console.log(results.length)
                if(results.length === 0){
                    dbo.collection('patients').find({ Id: {$in: patients}, RACE: race, ETHNICITY: ethnicity, GENDER: gender }).toArray((err,results) => {
                        if(err)
                            throw err
                        console.log(results.length)
                        if(results.length === 0){
                            dbo.collection('patients').find({ Id: {$in: patients}, ETHNICITY: ethnicity, GENDER: gender }).toArray((err,results) => {
                                if(err)
                                    throw err
                                console.log(results.length)
                                if(results.length === 0){
                                    dbo.collection('patients').find({ Id: {$in: patients}, GENDER: gender }).toArray((err,results) => {
                                        if(err)
                                            throw err
                                        console.log(results.length)
                                        let prob = results.length/patients.length
                                        res.send(`${prob}`)
                                    })
                                }
                                else{
                                    let prob = results.length/patients.length
                                    res.send(`${prob}`)
                                }
                            })
                        }
                        else{
                            let prob = results.length/patients.length
                            res.send(`${prob}`)
                        }
                    })
                }
                else{
                    let prob = results.length/patients.length
                    res.send(`${prob}`)
                }
            })
        }
        else{
            let prob = 0
            res.send(`${prob}`)
        }
    })
})

let port = process.env.PORT || 3000
app.listen(port,() => console.log(`Server started on port ${port}`))