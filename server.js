//setup
//#region

if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const uri = process.env.CONNECTION_TO_DATABASE
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const User = require('./models/user')
const DailySales = require('./models/dailySales')
const WeeklySales = require('./models/weeklySales')
const Store = require('./models/store')
const Promo = require("./models/promo")
const passport= require('passport')
const session = require('express-session')
const flash = require('express-flash')
const LocalStrategy = require('passport-local').Strategy
const dailySales = require('./models/dailySales')
const app = express()
const { DateTime, Interval } = require('luxon')
const user = require('./models/user')
const WeeklyStore = require('./models/weeklyStore')
const Logs = require('./models/logs')
const weeklyStore = require('./models/weeklyStore')
const { findOne, findById, findByIdAndDelete } = require('./models/user')
const DailyStore = require('./models/dailyStore')


const commnac = process.env.COMMNAC
const commtnac = process.env.COMMTNAC
const commmbb = process.env.COMMMBB
const commhup = process.env.COMMHUP
const commamc = process.env.COMMAMC
const commfdp = process.env.COMMFDP
const commacc = process.env.COMMACC
const commtvm = process.env.COMMTVM

try{
    mongoose.connect(uri, {
        useNewUrlParser: true, useUnifiedTopology: true
    }).then(()=>{
        console.log('Connected')
    }).catch(e=>{
        console.log(e)
    })
}catch (e){b
    handleError(e)
}
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')

app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
    secret: process.env.CURRENT_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(function (user, done){
    done(null, user.id)
})
passport.deserializeUser(function (id, done){
    User.findById(id, function (err, user) {
        done(err, user)
    })
})
passport.use(new LocalStrategy(function (username, password, done) {
    User.findOne({username: username}, function (err, user){
        if(err) return done(err)
        if(!user) return done(null, false, {message: 'Wrong username!'})

        bcrypt.compare(password, user.password, function (err, res) {
            if(err) return done(err)
            if(res === false) return done(null, false, {message: 'Wrong passsword!'})

            userLoggedInUsername = User.findOne({username: username})
            return done(null, user)
        })
    })
}))

//#endregion


//paths
//#region

app.get('/profile', isAuthUser, (req, res) => {
    let user = req.user
    res.render('updateaccount.ejs', {user: user})
})

app.get('/register', isAuthandMgrUser, (req, res) => {
    res.render('register.ejs')
})

app.post('/update/user', isAuthUser, async (req, res) => {
    let isUser = bcrypt.compare(req.body.passwordold, user.password)
    if(isUser){
    const SafePass = await bcrypt.hash(req.body.passwordnew, 10)

    user = await User.findOneAndDelete({username: req.body.username})
    if(user != null){
        let newuser = await User.findByIdAndUpdate({_id: user._id}, {password: SafePass})
        await newuser.save()
    }
    try{
        res.redirect('/logout')
    }catch{
        res.render('/profile')
    }
    }   
})

app.post('/register', isAuthandMgrUser, async (req, res) => {
    const SafePass = await bcrypt.hash(req.body.password, 10)

    var user = new User({
        name: req.body.name,
        role: req.body.role,
        username: req.body.username,
        password: SafePass
    })
    try{
        user = await user.save()
        res.redirect('/logout')
    }catch{
        res.render('/register')
    }
})

app.get('/', (req, res) => {
    res.redirect('/home')
})

app.get('/login', isnotAuthUser, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/5501/home',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/home', isAuthUser, async (req, res) => {
        var date = DateTime.now().setZone('America/Denver')
        var year = date.year
        var day = date.day.toString()
        var month = date.month.toString()
        let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
        var strDate = getInputDate(day, month, year)
        let users = await findOtherUsers(req.user.name)
        let myweek = await findMyWeek(week, year, req.user.name)
        let mystore = await findStoreMonthly(month, year)
        let weeklySales = await getStoreWeekly(week, year)
        let storeDaily = await getStoreDaily(year, week, day, strDate)

        res.render('home.ejs', {users: users, username: req.user, date: strDate, mystore: mystore, myweek: myweek, storeDaily: storeDaily})
})

app.get('/promos', isAuthUser, async (req, res) => {
    var date = DateTime.now().setZone('America/Denver')
    var year = date.year
    var day = date.day.toString()
    var month = date.month.toString()
    var strDate = getInputDate(day, month, year)
    let users = await findOtherUsers(req.user.name)

    let activePromos = await getActivePromos()
    let retiredPromos = await getRetiredPromos()



    res.render('promos.ejs', {users: users, username: req.user, date: strDate, activePromos: activePromos, retiredPromos: retiredPromos})
})

app.get('/add/promotion', isAuthUser, async (req, res) => {
    var date = DateTime.now().setZone('America/Denver')
    var year = date.year
    var day = date.day.toString()
    var month = date.month.toString()
    var promoDate = getInputDate(day, month, year)

    var promo = new Promo({
        title: "",
        type: "",
        terms: "",
        soccode: "",
        plan: "",
        desc: "",
        onesourceID: "",
    })




    res.render('promoAdd.ejs', {username: req.user, date: promoDate, promo: promo})
})

app.get('/5501/home', isAuthUser, async (req, res) => {
    try{
        var year = DateTime.now().setZone('America/Denver').year
        var day = DateTime.now().setZone('America/Denver').day.toString()
        var month = DateTime.now().setZone('America/Denver').month.toString()
        let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
        var strDate = getInputDate(day, month, year)
        genWeeklySales(year, week)
        let users = await findOtherUsers(req.user.name)
        let myweek = await findMyWeek(week, year, req.user.name)
        let mystore = await findStoreMonthly(month, year)
        let storeDaily = await getStoreDaily(year, week, day, strDate);


        res.render('home.ejs', {users: users, username: req.user, date: strDate, mystore: mystore, myweek: myweek, storeDaily: storeDaily})
    }
    catch{
        res.redirect('/5501/home')
    }
})

app.get('/sales', isAuthUser, async (req, res) => {
    let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
    let year = DateTime.now().setZone('America/Denver').year
    let weekNow = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
    let user = req.user

    let mysales = await findMySales(week, year, req.user.name)
    let users = await findOtherUsers(req.user.name)
    //let myweek = await findMyWeek(week, year, req.user.name)
    let myweek = await WeeklySalesGen(year, week, req.user.username, req.user.name)
    if(mysales == null && myweek != null){
        await WeeklySales.findByIdAndDelete(myweek._id)
    }
    
    res.render('sales.ejs', {mysales: mysales, username: req.user, users: users, myweek: myweek, year: year, weekNow: weekNow, user: user, week: week})
})

app.get('/store', isAuthUser, async (req, res) => {
    let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
    let year = DateTime.now().setZone('America/Denver').year
    var month = DateTime.now().setZone('America/Denver').month
    let weekNow = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
    
    let weeklySales = await WeeklySales.find({
        week: week,
        year: year
    }).sort({weeklyhours: -1})

    //let storeWeekly = await findStoreWeek(week, year, month)
    let storeWeekly = await getStoreWeekly(week, year)
    let thisWeek = await findWeeklySales(week, year)
    await removeUnwantedWeeks(weeklySales)

    year = parseInt(year)
    week = parseInt(week)

    

    res.render('storesales.ejs', {username: req.user, thisWeek: thisWeek, week: week, storeWeekly: storeWeekly, weeklySales: weeklySales, year: year, weekNow: weekNow})
})

app.get('/store/:year/:week', isAuthUser, async (req, res) => {
    let week = req.params.week
    let year = req.params.year
    let weekNow = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
    var month = DateTime.now().setZone('America/Denver').month
    genWeeklySales(year, week)

    //let storeWeekly = await findStoreWeek(week, year, user)
    let storeWeekly = await getStoreWeekly(week, year)
    let thisWeek = await findWeeklySales(week, year)

    year = parseInt(year)
    week = parseInt(week)
    

    res.render('storesales.ejs', {username: req.user, thisWeek: thisWeek, week: week, storeWeekly: storeWeekly, year: year, weekNow: weekNow})
})

app.get('/store/manage', isAuthandMgrUser, async (req, res) => {
    let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
    var month = DateTime.now().setZone('America/Denver').month
    let year = DateTime.now().setZone('America/Denver').year

    let weeklySales = await WeeklySales.find({
        week: week,
        year: year
    }).sort({weeklyhours: -1})

    let monthlyStore = await Store.findOne({
        month: month,
        year: year
    })

    let thisWeek = await WeeklyStore.findOne({
        week: week,
        year: year
    })

    let retiredUsers = await User.find({
        role: "Retired"
    })

    let users = await findOtherUsers(req.user.name)




    res.render('manage.ejs', {username: req.user, thisWeek: thisWeek, week: week, monthlyStore: monthlyStore, weeklySales: weeklySales, users: users, retiredUser: retiredUsers})
})

app.get('/logs', isAuthUser, async (req, res) => {
    let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
    let year = DateTime.now().setZone('America/Denver').year

    let mysales = await DailySales.find({}).sort({date: -1})

    res.render('logs.ejs', {mysales: mysales, username: req.user})
})

app.get('/logs/log', isAuthUser, async (req, res) => {
    let week = DateTime.now().plus({day: 1}).weekNumber
    let year = DateTime.now().year

        var year1 = DateTime.now().year
        var day1 = DateTime.now().day.toString()
        var month1 = DateTime.now().month.toString()
        var strDate = getInputDate(day1, month1, year1)

    let date = DateTime.now()

    let date1 = DateTime.now().setZone('America/Denver')

    let mysales = await Logs.find({}).sort({timeanddate: -1})

    res.render('log.ejs', {mysales: mysales, username: req.user, date: date, strDate: strDate, date1: date1})
})

app.get('/returns', isAuthUser, async (req, res) => {
    var date = DateTime.now().setZone('America/Denver')
    var year = date.year
    var day = date.day.toString()
    var month = date.month.toString()
    let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
    var strDate = getInputDate(day, month, year)

    let users = await User.find({
        name: {
            $ne: req.user.name
        }
    })

    let mystore = await Store.findOne({
        month: month,
        year: year
    })

    res.render('returns.ejs', {users: users, username: req.user, date: strDate, mystore: mystore})
})

app.post('/add/sale', isAuthUser, async (req, res) => {
    var a = req.body

    let user = await User.findOne({
        name: {
            $eq: req.body.rep
        }
    })

    var date = a.saleDate
    var strofDate = date.split('-')
    var year = parseInt(strofDate[0])
    
    var day = parseInt(strofDate[2])
    var month = parseInt(strofDate[1])
    var dateOfDay = DateTime.now(year, month, day).setZone('America/Denver')
    var daystr = dateOfDay.weekdayLong
    let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber


    var dateNow = DateTime.now().setZone('America/Denver')
    var yearNow = dateNow.year
    var dayNow = dateNow.day.toString()
    var monthNow = dateNow.month.toString()
    var strDate = getInputDate(dayNow, monthNow, yearNow)

    
    

    if(a.byodnac > 0 || a.byodmbb > 0 || a.termnac > 0 || a.termmbb > 0 || a.hup > 0 || a.fdp > 0 || a.mcApp > 0 || a.acc > 0 || a.bpo > 0 || a.express > 0 || a.tvm > 0){
        mysales = await DailySales.findOne({
            date: a.saleDate, 
            user: req.body.rep
        })

        let myweek = await WeeklySales.findOne({
            week: week, 
            user: req.body.rep,
            year: year
        })

        let weeklyStore = await WeeklyStore.findOne({
            week: week,
            year: year
        })

        if(weeklyStore == null){
            
            weeklyStore = await getStoreWeekly(week, year)
            
        }
        


        if(mysales == null){
            mysales = new WeeklySales({
                date : strDate,
                year : year,
                month : month,
                week : week,
                day : day,
                userID : req.user.username,
                user : a.rep,
                userCommission : 0,
                nac : 0,
                termNac : 0,
                mbb : 0,
                termMbb : 0,
                hup : 0,
                tvm: 0,
                express:0,
                fdp : 0,
                acc : 0,
                bpo : 0,
                mc : 0,
                mcReview : 0,
                mcApproved : 0,
                totalSubs : 0,
                termSubs : 0,
                ars : 0,
                fdpAttach : 0,
            })
        }

        let mystore = await Store.findOne({
            month: month,
            year: year
        })

        let logSale = new Logs({
            date: date,
            year: year,
            month: month,
            week: week,
            day: daystr,
            user: req.user.name,
            userID: req.user.username,
            userFor: user.name,
            userForID: user.username,
            timeanddate: dateOfDay
        })


        addSale(a, user, myweek, mystore, mysales, weeklyStore, logSale)
        
    }   
    res.redirect('/home')
})

app.post('/return/sale', isAuthUser, async (req, res) => {
    try{
    var a = req.body
    let user = await User.findOne({
        name: {
            $eq: req.body.rep
        }
    })

    var date = a.saleDate
    var strofDate = date.split('-')
    var year = parseInt(strofDate[0])
    var day = parseInt(strofDate[2])
    var month = parseInt(strofDate[1])
    var dateOfDay = DateTime.now(year, month, day).setZone('America/Denver')
    var week = dateOfDay.setZone('America/Denver').plus({day: 1}).weekNumber
    var daystr = dateOfDay.weekdayLong

    if(a.byodnac > 0 || a.byodmbb > 0 || a.termnac > 0 || a.termmbb > 0 || a.hup > 0 || a.fdp > 0 || a.mc > 0 || a.acc > 0 || a.bpo > 0 || a.express > 0 || a.tvm > 0){
        
        let mysales = await DailySales.findOne({
            date: a.saleDate, 
            user: req.body.rep
        })
        let myweek = await WeeklySales.findOne({
            week: week, 
            user: req.body.rep,
            year: year
        })

        let mystore = await Store.findOne({
            month: month,
            year: year
        })

        let weeklyStore = await WeeklyStore.findOne({
            week: week,
            year: year
        })

        let logSale = new Logs({
            date: date,
            year: year,
            month: month,
            week: week,
            day: daystr,
            user: req.user.name,
            userID: req.user.username,
            userFor: user.name,
            userForID: user.username,
            timeanddate: dateOfDay
        })

        if(mysales != null){
            returnSale(a, mysales, user, myweek, mystore, weeklyStore, logSale)

            res.redirect('/home')

        }else{

            res.redirect('/returns')

        }   
    }
    }catch{}
})

app.get('/sale/:id', isAuthUser, async (req, res) => {

var sale = await DailySales.findById({_id: req.params.id})

res.render('sale.ejs', {username: req.user, sale: sale})
})

app.get('/promotion/:id', isAuthUser, async (req, res) => {

    var promo = await Promo.findById({_id: req.params.id})
    
    res.render('promo.ejs', {username: req.user, promo: promo, date: promo.startDate})
})

app.get('/edit/promotion/:id', isAuthUser, async (req, res) => {

    var promo = await Promo.findById({_id: req.params.id})
    
    res.render('promoEdit.ejs', {username: req.user, promo: promo, date: promo.startDate})
})

app.get('/delete/promotion/:id', isAuthandMgrUser, async (req, res) => {

    var promo = await Promo.findByIdAndDelete({_id: req.params.id})
    
    res.redirect('/promos')
})

app.get('/retire/promotion/:id', isAuthUser, async (req, res) => {

    var date = DateTime.now().setZone('America/Denver')
    var year = date.year
    var day = date.day.toString()
    var month = date.month.toString()
    var strDate = getInputDate(day, month, year)

    var promo = await Promo.findByIdAndUpdate({_id: req.params.id},{isActive: false, endDate: strDate})
    promo = await promo.save()
    
    res.redirect('/promos')
})

app.post('/extend/promotion/:id', isAuthUser, async (req, res) => {
    var a = req.body
    var date = DateTime.now().setZone('America/Denver')
    var year = date.year
    var day = date.day.toString()
    var month = date.month.toString()
    var strDate = getInputDate(day, month, year)
    var enddateText
    if(a.date == null || a.date == ""){
        enddateText = "Extended"
    }else{
    enddateText = a.date
    }


    var promo = await Promo.findByIdAndUpdate({_id: req.params.id},{isActive: true, endDate: enddateText})
    promo = promo.save()
    
    res.redirect('/promos')
})

app.post('/updated/promotion/:id', isAuthUser, async (req, res) => {
    var a = req.body
    var date = a.startDate
    var strofDate = date.split('-')
    var year = parseInt(strofDate[0])
    var dayy = parseInt(strofDate[2])
    var month = parseInt(strofDate[1])
    var dateOfDay = DateTime.utc(year, month, dayy).setZone('America/Denver')

    var promo = new Promo({
        title: a.title,
        type: a.type,
        terms: a.terms,
        soccode: a.soccode,
        plan: a.plans,
        desc: a.description,
        onesourceID: a.onesourceID,
        startDate: date,
        endDate: "Ongoing",
        isActive: true,
        BeginDate: dateOfDay
    })

    promo = await promo.save()
    await Promo.findByIdAndDelete({_id: req.params.id})

    res.redirect('/promos')
})

app.get('/weekly/:username/:year/:week', isAuthUser, async (req, res) => {

    let users = await User.find({})
    let weekNow = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber
    var week = parseInt(req.params.week)
    var year = parseInt(req.params.year)

    let user = await User.findOne({
        username: req.params.username
    })

    let mysales = await DailySales.find({
        userID:  req.params.username,
        week: req.params.week,
        year: req.params.year

    }).sort({date: -1})  

    // let myweek = await WeeklySales.findOne({
    //     userID:  req.params.username,
    //     week: req.params.week,
    //     year: req.params.year
    // })

    
    let myweek = await WeeklySalesGen(req.params.year, req.params.week, user.username, user.name)

    res.render('sales.ejs', {mysales: mysales, username: req.user, myweek: myweek, year: year, weekNow: weekNow, user: user, week: week})
})

app.get('/sale/delete/:id', isAuthUser, async (req, res) => {
    
    await DailySales.findByIdAndDelete({_id: req.params.id})
    
    res.redirect('/sales')
})

app.post('/delete/user', isAuthUser, async (req, res) => {

    var username = req.body.rep
    
    var user = await User.findOne({
        name: username
    })
    var id = user._id
    await User.findByIdAndDelete({_id: id})
    
    res.redirect('/store/manage')
})

app.post('/added/promotion', isAuthUser, async (req, res) => {
    var a = req.body
    var date = a.startDate
    var strofDate = date.split('-')
    var year = parseInt(strofDate[0])
    var dayy = parseInt(strofDate[2])
    var month = parseInt(strofDate[1])
    var dateOfDay = DateTime.utc(year, month, dayy).setZone('America/Denver')

    var promo = new Promo({
        title: a.title,
        type: a.type,
        terms: a.terms,
        soccode: a.soccode,
        plan: a.plans,
        desc: a.description,
        onesourceID: a.onesourceID,
        startDate: date,
        endDate: "Ongoing",
        isActive: true,
        BeginDate: dateOfDay
    })

    promo = await promo.save()

    res.redirect('/promos')
})

app.post('/retire/user', isAuthUser, async (req, res) => {

    var username = req.body.repname
    
    var userOld = await User.findOne({
        name: username
    })
    var name = userOld.name
    var empID = userOld.username
    var id = userOld._id
    
    const SafePass = await bcrypt.hash("retired", 10)

    var user = new User({
        name: name,
        role: "Retired",
        username: empID,
        password: SafePass
    })
    try{
        await User.findByIdAndDelete({_id: id})
        user = await user.save()
    }catch{
    }
    
    res.redirect('/store/manage')
})

app.post('/update/weekly/targets', isAuthandMgrUser, async (req, res) => {
    var date = DateTime.now().setZone('America/Denver')
    var year = date.year
    var day = date.day.toString()
    var month = date.month.toString()
    let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber

    var a = req.body

    let thisWeek = await WeeklyStore.findOne({
        week: week,
        year: year
    })

    updateWeekMngr(a, week, year, thisWeek)


    

    res.redirect('/store/manage')
})

app.post('/update/monthly/bpo', isAuthandMgrUser, async (req, res) => {
    var date = DateTime.now().setZone('America/Denver')
    var year = date.year
    var day = date.day.toString()
    var month = date.month.toString()
    let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber

    var a = req.body

    let monthlyStore = await Store.findOne({
        month: month,
        year: year
    })

    updateMonthMngr(a, month, year, monthlyStore)

    res.redirect('/store/manage')
})

app.post('/update/weekly/users', isAuthandMgrUser, async (req, res) => {
    var date = DateTime.now().setZone('America/Denver')
    var year = date.year
    var day = date.day.toString()
    var month = date.month.toString()
    let week = DateTime.now().setZone('America/Denver').plus({day: 1}).weekNumber

    var a = req.body
   


    let weeklySales = await WeeklySales.findOne({
        week: week,
        year: year,
        user: a.rep
    })


    updateWeeklyUsersMngr(a, week, year, weeklySales)

    res.redirect('/store/manage')
})

app.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})
//#endregion


//functions
//#region
async function updateSales(){
    sales = await DailySales.find({})

    sales.forEach(sale =>{
        updateSale(sale._id)
    })

    async function updateSale(id){
        await DailySales.findOneAndUpdate({_id:id}, {$set: {area: 35, store:5501, brand:"F"}})
    }

    sales1 = await DailyStore.find({})

    sales1.forEach(sale =>{
        updateSale1(sale._id)
    })

    async function updateSale1(id){
        await DailyStore.findOneAndUpdate({_id:id}, {$set: {area: 35, store:5501, brand:"F"}})
    }

    sales2 = await WeeklySales.find({})

    sales2.forEach(sale =>{
        updateSale2(sale._id)
    })

    async function updateSale2(id){
        await WeeklySales.findOneAndUpdate({_id:id}, {$set: {area: 35, store:5501, brand:"F"}})
    }

    sales3 = await WeeklyStore.find({})

    sales3.forEach(sale =>{
        updateSale3(sale._id)
    })

    async function updateSale3(id){
        await WeeklyStore.findOneAndUpdate({_id:id}, {$set: {area: 35, store:5501, brand:"F"}})
    }

    sales4 = await Store.find({})

    sales4.forEach(sale =>{
        updateSale4(sale._id)
    })

    async function updateSale4(id){
        await Store.findOneAndUpdate({_id:id}, {$set: {area: 35, store:5501, brand:"F"}})
    }

    sales5 = await User.find({})

    sales5.forEach(sale =>{
        updateSale5(sale._id)
    })

    async function updateSale5(id){
        await User.findOneAndUpdate({_id:id}, {$set: {area: 35, store:5501, brand:"F"}})
    }

}

async function getStoreDaily(year, week, day, strDate){


    var totalSubs=0
    var acc=0
    var termSubs=0
    var fdp = 0
    var bpo = 0
    

    oldDaily = await DailyStore.findOne({
        week: week,
        year: year,
        day: day,
        date: strDate
    })

    
    if(oldDaily != null){
    var id = oldDaily._id
    await DailyStore.findByIdAndDelete({
        _id: id
    })
    }

    sales = await DailySales.find({
        week: week,
        year: year,
        date: strDate
    })
    sales.forEach(sale =>{
        var totalSubsi=0
        var acci=0
        var termSubsi=0
        var fdpi = 0
        var bpoi

        if(sale.totalSubs == null){totalSubsi = 0}else{totalSubsi = sale.totalSubs}
        if(sale.termSubs == null){termSubsi = 0}else{termSubsi = sale.termSubs}
        if(sale.fdp == null){fdpi = 0}else{fdpi = sale.fdp}
        if(sale.acc == null){acci = 0}else{acci = sale.acc}
        if(sale.bpo == null){bpoi = 0}else{bpoi = sale.bpo}

        bpo = bpo + bpoi
        totalSubs = totalSubs + totalSubsi
        acc = acc + acci
        termSubs = termSubs + termSubsi
        fdp = fdp + fdpi
    })

    

    var ars = (acc / totalSubs).toFixed(2)
    var fdpAttach = ((fdp / termSubs).toFixed(2) * 100)

    if(isNaN(ars)){
        ars = 0
    }
    if(isNaN(fdpAttach)){
        fdpAttach = 0
    }

    let newDaily = new DailyStore({
        totalSubs: totalSubs,
        acc: acc,
        termSubs: termSubs,
        fdp: fdp,
        ars: ars,
        fdpAttach: fdpAttach,
        bpo: bpo,
        year: year,
        week: week,
        day: day,
        date: strDate
    })

    await newDaily.save()

    return newDaily
}

async function WeeklySalesGen(year, week, username, name){
    var express = 0, nac = 0, termnac = 0, hup = 0, mbb = 0, termmbb = 0, tvm = 0, tvmAttach = 0, fdp = 0, acc = 0, fdpAttach = 0, commission = 0, mca = 0, mcr = 0, mc = 0

    oldWeek = await WeeklySales.findOne({
        week: week,
        year: year,
        userID: username
    })

    if(oldWeek != null){
        var id = oldWeek._id
        await WeeklySales.findByIdAndDelete({
            _id: id
        })
    }

    sales =  await DailySales.find({
        week: week,
        year: year,
        userID: username
    })

    sales.forEach(sale =>{
        if(sale.express == null){var iexpress = 0}else{var iexpress = sale.express}
        if(sale.nac == null){var inac = 0}else{var inac = sale.nac}
        if(sale.termNac == null){var itnac = 0}else{var itnac = sale.termNac}
        if(sale.hup == null){var ihup = 0}else{var ihup = sale.hup}
        if(sale.mbb == null){var imbb = 0}else{var imbb = sale.mbb}
        if(sale.termMbb == null){var itmbb = 0}else{var itmbb = sale.termMbb}
        if(sale.tvm == null){var itvm = 0}else{var itvm = sale.tvm}
        if(sale.fdp == null){var ifdp = 0}else{var ifdp = sale.fdp}
        if(sale.acc == null){var iacc = 0}else{var iacc = sale.acc}
        if(sale.mcApproved == null){var imca = 0}else{var imca = sale.mcApproved}
        if(sale.mcReview == null){var imcr = 0}else{var imcr = sale.mcReview}
        if(sale.userCommission == null){var icommission = 0}else{var icommission = sale.userCommission}


        express += iexpress
        nac += inac
        termnac += itnac
        hup += ihup
        mbb += imbb
        termmbb += itmbb
        tvm += itvm
        fdp += ifdp
        acc += iacc
        commission += icommission
        mca += imca
        mcr += imcr
    })

    var termSubs = (termnac + termmbb + hup)
    fdpAttach = ((fdp / termSubs).toFixed(2) * 100)
    tvmAttach = ((tvm/hup).toFixed(2) * 100)

    mc = mcr + mca

    if(isNaN(fdpAttach)){
        fdpAttach = 0
    }
    if(isNaN(tvmAttach)){
        tvmAttach = 0
    }

    let newWeekly = new WeeklySales({
        week: week,
        year: year,
        userID: username,
        user: name,
        express: express,
        nac: nac,
        termNac: termnac,
        hup: hup,
        mbb: mbb,
        termMbb: termmbb,
        tvm: tvm,
        fdp: fdp,
        acc: acc,
        mc: mc,
        mca: mca,
        mcr: mcr,
        userCommission: commission,
        fdpAttach: fdpAttach,
        tvmAttach: tvmAttach,
        termSubs: termSubs
    })


    await newWeekly.save()
    return newWeekly
}

async function getStoreWeekly(week, year){

    let dt = DateTime.fromObject({
        weekYear: year,
        weekNumber: week
      })
    const dateToStr = dt.endOf('week').minus({day: 1})
    var eow = dateToStr.toISO().slice(0,10)
    var strofDate = eow.split('-')
    var year = parseInt(strofDate[0])
    var day = parseInt(strofDate[2])
    var month = parseInt(strofDate[1])
    var dateOfDay = DateTime.now(year, month, day).setZone('America/Denver')
    var daystr = dateOfDay.monthShort + " " + day

    var express = 0, nac = 0, termnac = 0, hup = 0, mbb = 0, termmbb = 0, tvm = 0, tvmAttach = 0, fdp = 0, acc = 0, fdpAttach = 0, commission = 0, mca = 0, mcr = 0, mc = 0

    var target, strech, weeklyhours, weeklyAchieved
    

    oldWeekly = await WeeklyStore.findOne({
        week: week,
        year: year
    })

    
    if(oldWeekly != null){
    var id = oldWeekly._id

        if(oldWeekly.target == null){target = 25}else{target = oldWeekly.target}
        if(oldWeekly.strech == null){strech = 35}else{strech = oldWeekly.strech}
        if(oldWeekly.weeklyhours == null){weeklyhours = 140}else{weeklyhours = oldWeekly.weeklyhours}

    await WeeklyStore.findByIdAndDelete({
        _id: id
    })
    }

    sales = await WeeklySales.find({
        week: week,
        year: year
    })
    sales.forEach(sale =>{

        if(sale.express == null){var iexpress = 0}else{var iexpress = sale.express}
        if(sale.nac == null){var inac = 0}else{var inac = sale.nac}
        if(sale.termNac == null){var itnac = 0}else{var itnac = sale.termNac}
        if(sale.hup == null){var ihup = 0}else{var ihup = sale.hup}
        if(sale.mbb == null){var imbb = 0}else{var imbb = sale.mbb}
        if(sale.termMbb == null){var itmbb = 0}else{var itmbb = sale.termMbb}
        if(sale.tvm == null){var itvm = 0}else{var itvm = sale.tvm}
        if(sale.fdp == null){var ifdp = 0}else{var ifdp = sale.fdp}
        if(sale.acc == null){var iacc = 0}else{var iacc = sale.acc}
        if(sale.mca == null){var imca = 0}else{var imca = sale.mca}
        if(sale.mcr == null){var imcr = 0}else{var imcr = sale.mcr}

        express += iexpress
        nac += inac
        termnac += itnac
        hup += ihup
        mbb += imbb
        termmbb += itmbb
        tvm += itvm
        fdp += ifdp
        acc += iacc
        mca += imca
        mcr += imcr

    })

    var totalSubs = (nac + termnac + hup + mbb + termmbb + mcr + mca)
    if(totalSubs > strech){
        weeklyAchieved = "Green"
    }else if (totalSubs > target){
        weeklyAchieved = "Yellow"
    }else{
        weeklyAchieved = "Red"
    }

    var termSubs = (termnac + termmbb + hup)
    fdpAttach = ((fdp / termSubs).toFixed(2) * 100)
    tvmAttach = ((tvm/hup).toFixed(2) * 100)

    mc = mcr + mca

    if(isNaN(fdpAttach)){
        fdpAttach = 0
    }
    if(isNaN(tvmAttach)){
        tvmAttach = 0
    }

    let newWeekly = new WeeklyStore({
        week: week,
        year: year,
        express: express,
        nac: nac,
        termNac: termnac,
        hup: hup,
        mbb: mbb,
        termMbb: termmbb,
        tvm: tvm,
        fdp: fdp,
        acc: acc,
        mc: mc,
        mca: mca,
        mcr: mcr,
        fdpAttach: fdpAttach,
        tvmAttach: tvmAttach,
        termSubs: termSubs,
        target: target,
        strech: strech,
        weeklyAchieved: weeklyAchieved,
        weeklyhours: weeklyhours,
        endOfWeek: daystr
    })

    console.log(newWeekly)
    await newWeekly.save()

    return newWeekly
}

async function getActivePromos(){
    let promos = await Promo.find({
        isActive: true
    })
    return promos
}

async function getRetiredPromos(){
    let promos = await Promo.find({
        isActive:{
            $ne: true
        }
    })
    return promos
}

async function genWeeklySales(year, week){
    let users = await User.find({})

    users.forEach(async user => {
        if(user.name != undefined) {
            if(user.role != "Retired"){
            let myweek = await WeeklySales.findOne({
                week: week, 
                user: user.name,
                year: year
            })
            
            if(myweek == null){
                myweek = new WeeklySales({
                    user: user.name,
                    userID: user.username,
                    week: week,
                    year: year,
                    totalSubs: 0,
                    termSubs: 0,
                    acc: 0,
                    ars: 0,
                    fdpAttach: 0,
                    fdp: 0,
                    weeklyhours: 20,
                    retired: false
                })
                myweek = await myweek.save()
            }
            }
        }
    })
}

async function findOtherUsers(user){
    let users = await User.find({
        name: {
            $ne: user
        },
        role:{
            $ne: "Retired"
        }
    })
    return users
}

function getInputDate(day, month, year){
    for(i = 0; i < 10; i++){
        if(day == i){
            day = "0" + i
        }
        if(month == i){
            month = "0" + i
        }
    
        }
        var strDate = year.toString() + "-" + month + "-" + day
        return strDate
}

async function findMySales(week, year, user){
    
    let mysales = await DailySales.find({
        user: user,
        week: week,
        year: year

    }).sort({date: -1})

    return mysales
}

async function findMyWeek(week, year, user){

    let myweek = await WeeklySales.findOne({
        week: week, 
        user: user,
        year: year
    })
    
    if(myweek == null){
        myweek = new WeeklySales({
            user: user,
            week: week,
            year: year,
            totalSubs: 0,
            termSubs: 0,
            acc: 0,
            ars: 0,
            fdpAttach: 0,
            fdp: 0,
        })
        myweek = await myweek.save()
    }

    return myweek
}

async function findWeeklySales(week, year){

    let thisWeek = await WeeklySales.find({
        week: week, 
        year: year,
        retired: {
            $ne: true
        }
    }).sort({userCommission: -1})

    return thisWeek
}

async function findStoreWeek(week, year, month){

    let weeklyStore = await WeeklyStore.findOne({
        week: week,
        year: year
    })



    let dt = DateTime.fromObject({
        weekYear: year,
        weekNumber: week
      })

    //const dateFromStr = dt.startOf('week').minus({day: 1});
    const dateToStr = dt.endOf('week').minus({day: 1})
    try{
    var eow = dateToStr.toISO().slice(0,10)
    var strofDate = eow.split('-')
    var year = parseInt(strofDate[0])
    var day = parseInt(strofDate[2])
    var month = parseInt(strofDate[1])
    var dateOfDay = DateTime.now(year, month, day).setZone('America/Denver')
    var daystr = dateOfDay.monthShort + " " + day

    if(weeklyStore == null){
        weeklyStore = new WeeklyStore({
            week: week,
            year: year,
            weeklyAchieved: "Red",
            target: 25,
            strech: 35,
            weeklyhours: 140,
            totalSubs: 0,
            termSubs: 0,
            acc: 0,
            fdp: 0,
            fdpAttach: 0,
            ars: 0,
            endOfWeek: daystr
        })
        weeklyStore = await weeklyStore.save()
    }
    }catch{}
    

    

    return weeklyStore
}

async function removeUnwantedWeeks(weeklySales){

    users = await User.find({})

    weeklySales.forEach(sale => {
        var isValid = false
        users.forEach(user =>{
            if(sale.user == user.name){
                isValid = true
            }
        })

        if(isValid != true){
            Del(sale._id)
        }
    })

    async function Del(id){
        await WeeklySales.findByIdAndDelete(id)
    }


}

async function findStoreMonthly(month, year){

    let mystore = await Store.findOne({
        month: month,
        year: year
    })

    if(mystore == null){
        mystore = new Store({
            month: month,
            year: year,
            storeBPO: 1500
        })
        mystore = await mystore.save()
    }

    return mystore
}

function getDate(){
    function pad2(n) {
        return (n < 10 ? '0' : '') + n;
    }

    var date = new Date();
    var month = pad2(date.getMonth()+1);//months (0-11)
    var day = pad2(date.getDate());//day (1-31)
    var year= date.getFullYear();

    var date =  year+"-"+month+"-"+day;
    return date
}

function isAuthUser(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function isAuthandMgrUser(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.role == "Management"){
        return next()
        }else{
            res.redirect('/home')
        }
    }else{
    res.redirect('/login')
    }
}

function isnotAuthUser(req, res, next){
    if(req.isAuthenticated()){
    res.redirect('/courses')
    }
    next()
}

async function addSale(a, user, myweek, store, mysales, weeklyStore, logSale){

    var stringValue = "add"
    //var bpoLeft = store.storeBPO

    if(!isNaN(parseInt(a.express))){
        var iexpress = parseInt(a.express)
    }else{
        var iexpress = 0
    }
    if(!isNaN(parseInt(a.byodnac))){
        var inac = parseInt(a.byodnac)
    }else{
        var inac = 0
    }
    if(!isNaN(parseInt(a.termnac))){
        var itnac = parseInt(a.termnac)
    }else{
        var itnac = 0
    }
    if(!isNaN(parseInt(a.byodmbb))){
        var imbb = parseInt(a.byodmbb)
    }else{
        var imbb = 0
    }
    if(!isNaN(parseInt(a.termmbb))){
        var itmbb = parseInt(a.termmbb)
    }else{
        var itmbb = 0
    }
    if(!isNaN(parseInt(a.hup))){
        var ihup = parseInt(a.hup)
    }else{
        var ihup = 0
    }
    if(!isNaN(parseInt(a.fdp))){
        var ifdp = parseInt(a.fdp)
    }else{
        var ifdp = 0
    }
    if(!isNaN(parseInt(a.acc))){
        var iacc = parseInt(a.acc)
    }else{
        var iacc = 0
    }
    if(!isNaN(parseInt(a.tvm))){
        var itvm = parseInt(a.tvm)
    }else{
        var itvm = 0
    }
    if(!isNaN(parseInt(a.bpo))){
        var ibpo = parseInt(a.bpo)
    }else{
        var ibpo = 0
    }
    if(!isNaN(parseInt(a.mcApp))){
        if(parseInt(a.mcApp) == "2"){
            var imcValue = "Approved"
            var imcApproved = 1
            var imcReview = 0
            var imc = 1
        }else if(parseInt(a.mcApp) == 1){
            var imcValue = "Review"
            var imcReview =  1
            var imcApproved = 0
            var imc = 1
        }else{
            var imcValue = ""
            var imc = 0
            var imcReview = 0
            var imcApproved = 0
        }
    }
    updateDaily(a, user, mysales, inac, itnac, imbb, itmbb, ihup, ifdp, iacc, itvm, imc, imcValue, ibpo, imcReview, imcApproved, myweek, stringValue, store, weeklyStore, iexpress)
    
    //userLogSale(a, user, inac, itnac, imbb, itmbb, ihup, ifdp, iacc, imc, ibpo, stringValue, logSale, iexpress)
}

async function returnSale(a, mysales, user, myweek, store, weeklyStore, logSale){

    var stringValue = "return"

    if(!isNaN(parseInt(a.express))){
        var iexpress = parseInt(a.express)
    }else{
        var iexpress = 0
    }
    if(!isNaN(parseInt(a.byodnac))){
        var inac = parseInt(a.byodnac)
    }else{
        var inac = 0
    }
    if(!isNaN(parseInt(a.termnac))){
        var itnac = parseInt(a.termnac)
    }else{
        var itnac = 0
    }
    if(!isNaN(parseInt(a.byodmbb))){
        var imbb = parseInt(a.byodmbb)
    }else{
        var imbb = 0
    }
    if(!isNaN(parseInt(a.termmbb))){
        var itmbb = parseInt(a.termmbb)
    }else{
        var itmbb = 0
    }
    if(!isNaN(parseInt(a.hup))){
        var ihup = parseInt(a.hup)
    }else{
        var ihup = 0
    }
    if(!isNaN(parseInt(a.tvm))){
        var itvm = parseInt(a.tvm)
    }else{
        var itvm = 0
    }
    if(!isNaN(parseInt(a.fdp))){
        var ifdp = parseInt(a.fdp)
    }else{
        var ifdp = 0
    }
    if(!isNaN(parseInt(a.acc))){
        var iacc = parseInt(a.acc)
    }else{
        var iacc = 0
    }
    if(!isNaN(parseInt(a.bpo))){
        var ibpo = parseInt(a.bpo)
    }else{
        var ibpo = 0
    }
    
        var imcValue = ""
        var imc = 0
        var imcReview = 0
        var imcApproved = 0

    updateDaily(a, user, mysales, inac, itnac, imbb, itmbb, ihup, ifdp, iacc, itvm, imc, imcValue, ibpo, imcReview, imcApproved, myweek, stringValue, store, weeklyStore, iexpress)

    //userLogSale(a, user, inac, itnac, imbb, itmbb, ihup, ifdp, iacc, imc, ibpo, stringValue, logSale, iexpress)
    

}

async function updateDaily(a, user, mysales, inac, itnac, imbb, itmbb, ihup, ifdp, iacc, itvm, imc, imcValue, ibpo, imcReview, imcApproved, myweek, stringValue, store, weeklyStore, iexpress){

    //declaring vars
    var nac, tnac, mbb, tmbb, hup, fdp, acc, bpo, mc, mcApproved, mcReview, mcValue, express, tvm, express
    var date = a.saleDate
    var strofDate = date.split('-')
    var year = parseInt(strofDate[0])
    var dayy = parseInt(strofDate[2])
    var month = parseInt(strofDate[1])
    var dateOfDay = DateTime.utc(year, month, dayy).setZone('America/Denver')
    var day = dateOfDay.plus({day: 1}).weekdayLong
    let week = DateTime.utc(year, month, dayy).setZone('America/Denver').plus({day: 2}).weekNumber

    //fetching old post info
    if(mysales.nac == null){nac = 0}else{nac = mysales.nac}
    if(mysales.termNac == null){tnac = 0}else{tnac = mysales.termNac}
    if(mysales.mbb == null){mbb = 0}else{mbb = mysales.mbb}
    if(mysales.termMbb == null){tmbb = 0}else{tmbb = mysales.termMbb}
    if(mysales.hup == null){hup = 0}else{hup = mysales.hup}
    if(mysales.fdp == null){fdp = 0}else{fdp = mysales.fdp}
    if(mysales.tvm == null){tvm = 0}else{tvm = mysales.tvm}
    if(mysales.acc == null){acc = 0}else{acc = mysales.acc}
    if(mysales.bpo == null){bpo = 0}else{bpo = mysales.bpo}
    if(mysales.mc == null){mc = 0}else{mc = mysales.mc}
    if(mysales.mcApproved == null){mcApproved = 0}else{mcApproved = mysales.mcApproved}
    if(mysales.mcReview == null){mcReview = 0}else{mcReview = mysales.mcReview}
    if(mysales.express == null){express = 0}else{express = mysales.express}

    //adding new input + old input
    if(stringValue == "add"){
        nac += inac
        tnac += itnac
        mbb += imbb
        tmbb += itmbb
        hup += ihup
        fdp += ifdp
        acc += iacc
        mc += imc
        bpo += ibpo
        mcApproved += imcApproved
        mcReview += imcReview
        mcValue = imcValue
        express += iexpress
        tvm += itvm
    }else if (stringValue == "return"){
        nac = nac - inac
        tnac = tnac - itnac
        mbb = mbb - imbb
        tmbb = tmbb - itmbb
        hup = hup - ihup
        fdp = fdp - ifdp
        acc = acc - iacc
        mc = imc
        bpo = bpo - ibpo
        mcApproved = imcApproved
        mcReview = imcReview
        mcValue = imcValue
        express = express - iexpress
        tvm = tvm - itvm
    }

    if(isNaN(imc)){
        imc = 0
    }

//calculating commisson
var commission = ((nac * commnac) + (tnac * commtnac) + ((mbb + tmbb) * commmbb) + (hup * commhup) + (fdp * commfdp) + (acc * commacc) + (mcApproved * commamc) + (tvm * commtvm)).toFixed(2)
var icommission = ((inac * commnac) + (itnac * commtnac) + ((imbb + tmbb) * commmbb) + (ihup * commhup) + (ifdp * commfdp) + (iacc * commacc) + (imcApproved * commamc) + (itvm * commtvm)).toFixed(2)

if(stringValue == "add"){
    hup = hup + itvm
}else if (stringValue == "return"){
    hup = hup - itvm
}

    var itotalSubs = (inac + itnac + imbb + itmbb + ihup + imc + iexpress)
    var itermSubs = ( itnac + itmbb + ihup)
    var iars = (iacc / itotalSubs).toFixed(2)
    var ifdpAttach = ((ifdp / itermSubs).toFixed(2) * 100)
    var itvmAttach = ((itvm/ihup).toFixed(2) * 100)

    var totalSubs = (nac + tnac + mbb + tmbb + hup + mc + express)
    var termSubs = (tnac + tmbb + hup)
    var ars = (acc / totalSubs).toFixed(2)
    var fdpAttach = ((fdp / termSubs).toFixed(2) * 100)
    var tvmAttach = ((tvm/hup).toFixed(2) * 100)

    if(isNaN(ars)){
        ars = 0
    }
    if(isNaN(fdpAttach)){
        fdpAttach = 0
    }
    if(isNaN(tvmAttach)){
        tvmAttach = 0
    }

    updateMonthly(a, ibpo, store, stringValue)
    //creating a new mongodb doc adding values to it
    var dailySales = new DailySales()

    dailySales.date = date
    dailySales.year = year
    dailySales.month = month
    dailySales.week = week
    dailySales.day = day
    dailySales.userID = user.username
    dailySales.user = a.rep
    dailySales.userCommission = commission
    dailySales.nac = nac
    dailySales.termNac = tnac
    dailySales.mbb = mbb
    dailySales.termMbb = tmbb
    dailySales.hup = hup
    dailySales.tvm = tvm
    dailySales.fdp = fdp
    dailySales.acc = acc
    dailySales.bpo = bpo
    dailySales.mc = mc
    dailySales.mcReview = mcReview
    dailySales.mcApproved = mcApproved
    dailySales.totalSubs = totalSubs
    dailySales.termSubs = termSubs
    dailySales.ars = ars
    dailySales.fdpAttach = fdpAttach
    dailySales.tvmAttach = tvmAttach
    dailySales.express = express

    //saving doc and deleting old one
    dailySales = await dailySales.save()
    if(mysales._id != null){
    await DailySales.findByIdAndDelete(mysales._id)
    }

    if(stringValue == "return"){
        if(commission == 0){
            if(bpo == 0){
                if(acc == 0){
                    await DailySales.findByIdAndDelete(dailySales._id)
                }
            }
        }
    }

    WeeklySalesGen(year, week, user.username, user.name)

}

async function updateWeekly(a, user, myweek, ifdp, iacc, itotalSubs, itermSubs,icommission, stringValue, ibpo, weeklyStore){
    //declaring vars
    let saleForUser = await User.findOne({name: a.rep})
    var date = a.saleDate
    var strofDate = date.split('-')
    var year = parseInt(strofDate[0])
    var dayy = parseInt(strofDate[2])
    var month = parseInt(strofDate[1])
    var dateOfDay = DateTime.utc(year, month, dayy).setZone('America/Denver')
    let week = DateTime.utc(year, month, dayy).setZone('America/Denver').plus({day: 2}).weekNumber


    if(isNaN(parseInt(myweek.termSubs))){
        myweek.termSubs = 0
    }
    if(isNaN(parseInt(myweek.totalSubs))){
        myweek.totalSubs = 0
    }
    if(isNaN(parseInt(myweek.acc))){
        myweek.acc = 0
    }
    if(isNaN(parseInt(myweek.fdp))){
        myweek.fdp = 0
    }
    if(isNaN(parseInt(myweek.ars))){
        myweek.ars = 0
    }
    if(isNaN(parseInt(myweek.userCommission))){
        myweek.userCommission = 0
    }
    if(isNaN(parseInt(myweek.fdpAttach))){
        myweek.fdpAttach = 0
    }
    if(isNaN(parseInt(myweek.bpo))){
        myweek.bpo = 0
    }

    if(isNaN(parseInt(weeklyStore.totalSubs)) || weeklyStore.totalSubs == null){
        weeklyStore.totalSubs = 0
    }
    if(isNaN(parseInt(weeklyStore.termSubs)) || weeklyStore.termSubs == null){
        weeklyStore.termSubs = 0
    }
    if(isNaN(parseInt(weeklyStore.acc)) || weeklyStore.acc == null){
        weeklyStore.acc = 0
    }
    if(isNaN(parseInt(weeklyStore.fdp)) || weeklyStore.fdp == null){
        weeklyStore.fdp = 0
    }
    if(isNaN(parseInt(weeklyStore.ars)) || weeklyStore.ars == null){
        weeklyStore.ars = 0
    }
    if(isNaN(parseInt(weeklyStore.fdpAttach)) || weeklyStore.fdpAttach == null){
        weeklyStore.fdpAttach = 0
    }
    if(stringValue == "add"){
        var totalSubs = myweek.totalSubs + itotalSubs
        var termSubs = myweek.termSubs + itermSubs
        var acc = myweek.acc + iacc
        var fdp = myweek.fdp + ifdp
        var bpo = myweek.bpo + ibpo
        var weeklyCommission = parseFloat(myweek.userCommission) + parseFloat(icommission)

        var totalSubs1 = weeklyStore.totalSubs + itotalSubs
        var termSubs1 = weeklyStore.termSubs + itermSubs
        var acc1 = weeklyStore.acc + iacc
        var fdp1 = weeklyStore.fdp + ifdp

    }else if(stringValue == "return"){
        var totalSubs = myweek.totalSubs - itotalSubs
        var termSubs = myweek.termSubs - itermSubs
        var acc = myweek.acc - iacc
        var fdp = myweek.fdp - ifdp
        var bpo = myweek.bpo - ibpo
        var weeklyCommission = myweek.userCommission - icommission

        var totalSubs1 = weeklyStore.totalSubs - itotalSubs
        var termSubs1 = weeklyStore.termSubs - itermSubs
        var acc1 = weeklyStore.acc - iacc
        var fdp1 = weeklyStore.fdp - ifdp
    }

    var ars = (acc / totalSubs).toFixed(2)
    var fdpAttach = ((fdp / termSubs).toFixed(2) * 100)

    var ars1 = (acc1 / totalSubs1).toFixed(2)
    var fdpAttach1 = ((fdp1 / termSubs1).toFixed(2) * 100)

    if(isNaN(fdpAttach)){
        fdpAttach = 0
    }
    if(isNaN(fdpAttach1)){
        fdpAttach1 = 0
    }

    if(isNaN(ars)){
        ars = 0
    }
    if(isNaN(ars1)){
        ars1 = 0
    }

    
    var target = myweek.target
    var strech = myweek.strech
    var weekoldhours = myweek.weeklyhours

    var weeklySales = new WeeklySales()
    
    weeklySales.userID = saleForUser.username
    weeklySales.user = a.rep
    
    weeklySales.year = year
    weeklySales.week = week
    weeklySales.weeklyhours = weekoldhours
    weeklySales.totalSubs = totalSubs
    weeklySales.acc = acc
    weeklySales.fdp = fdp
    weeklySales.fdpAttach = fdpAttach.toFixed(2)
    weeklySales.ars = ars
    weeklySales.termSubs = termSubs
    weeklySales.userCommission = weeklyCommission.toFixed(2)
    weeklySales.bpo = bpo
    weeklySales.target = target
    weeklySales.strech = strech

    if(totalSubs >= target){
        weeklySales.weeklyAchieved = "Yellow"

        if(totalSubs >= strech){
            weeklySales.weeklyAchieved = "Green"

        }
    }else {
        weeklySales.weeklyAchieved = "Red"
    }
    
    
    weeklySales= await weeklySales.save()

    /*var weekStore = new WeeklyStore()
    var target = weeklyStore.target
    var strech = weeklyStore.strech

    weekStore.totalSubs = totalSubs1
    weekStore.termSubs = termSubs1
    weekStore.year = year
    weekStore.week = week
    weekStore.target = target
    weekStore.strech = strech
    weekStore.weeklyhours = weeklyStore.weeklyhours
    weekStore.acc = acc1
    weekStore.fdp = fdp1
    weekStore.fdpAttach = fdpAttach1.toFixed(2)
    weekStore.ars = ars1
    weekStore.endOfWeek = weeklyStore.endOfWeek

    if(totalSubs1 >= target){
        weekStore.weeklyAchieved = "Yellow"
        if(totalSubs1 >= strech){
            weekStore.weeklyAchieved = "Green"
        }
    }else {
        weekStore.weeklyAchieved = "Red"
    }
    
    weekStore = await weekStore.save()

    if(weeklySales._id != null){
        await WeeklyStore.findByIdAndDelete(weeklyStore._id)
    }*/

    if(myweek._id != null){
        await WeeklySales.findByIdAndDelete(myweek._id)
    }
    
}

async function updateMonthly(a, ibpo, store, stringValue){

    var date = a.saleDate
    var strofDate = date.split('-')
    var year = parseInt(strofDate[0])
    var month = parseInt(strofDate[1])

    if(!isNaN(parseInt(store.storeBPO))){
        var bpoLeft = store.storeBPO
    }else{
        var bpoLeft = 0
    }
    if(stringValue == "add"){
        bpoLeft = bpoLeft - ibpo
    }else if (stringValue == "return"){
        bpoLeft = bpoLeft + ibpo
    }
    
    var monthlySales = new Store()

    monthlySales.storeBPO = bpoLeft
    monthlySales.month = month
    monthlySales.year = year 


    monthlySales= await monthlySales.save()
    
    if(store._id != null){
        await Store.findByIdAndDelete(store._id)
    }

}

async function updateWeekMngr(a, week, year, thisWeek){
    var weekStore = new WeeklyStore()
    var target = a.target
    var strech = a.strech
    var totalSubs = thisWeek.totalSubs
    weekStore.target = target
    weekStore.strech = strech
    weekStore.weeklyhours = a.whours
    weekStore.acc = thisWeek.acc
    weekStore.fdp = thisWeek.fdp
    weekStore.fdpAttach = thisWeek.fdpAttach
    weekStore.year = year
    weekStore.week = week
    weekStore.totalSubs = thisWeek.totalSubs
    weekStore.ars = thisWeek.ars
    weekStore.termSubs = thisWeek.termSubs
    weekStore.endOfWeek = thisWeek.endOfWeek

    if(totalSubs >= target){
        weekStore.weeklyAchieved = "Yellow"
        if(totalSubs >= strech){
            weekStore.weeklyAchieved = "Green"
        }
    }else {
        weekStore.weeklyAchieved = "Red"
    }
    
    weekStore = await weekStore.save()

    if(thisWeek._id != null){
        await WeeklyStore.findByIdAndDelete(thisWeek._id)
    }
}

async function updateMonthMngr(a, month, year, monthlyStore){
    var store = new Store()
    store.month = month
    store.year = year
    store.storeBPO = a.bpoUpdate

    store = await store.save()

    if(monthlyStore._id != null){
        await Store.findByIdAndDelete(monthlyStore._id)
    }
}

async function updateWeeklyUsersMngr(a, week, year, weeklySales){

    var weeklyStore = await WeeklyStore.findOne({
        week: week,
        year: year
    })

    var oldWeekhours = weeklyStore.weeklyhours
    var oldWeektarget = weeklyStore.target
    var oldWeekStrech = weeklyStore.strech


    var user = weeklySales.user
    var userID = weeklySales.userID
    var totalSubs = weeklySales.totalSubs
    var termSubs = weeklySales.termSubs
    var acc = weeklySales.acc
    var ars = weeklySales.ars
    var fdpA = weeklySales.fdpAttach
    var fdp = weeklySales.fdp
    var week = weeklySales.week
    var year = weeklySales.year
    var commission = weeklySales.userCommission
    var bpo = weeklySales.bpo

    var newWeek = new WeeklySales()

    newWeek.weeklyhours = a.weeklyHours

    newWeek.user = user
    newWeek.userID = userID
    newWeek.totalSubs = totalSubs
    newWeek.termSubs = termSubs
    newWeek.acc = acc
    newWeek.ars = ars
    newWeek.fdpAttach = fdpA
    newWeek.fdp = fdp
    newWeek.week = week
    newWeek.year = year
    newWeek.userCommission = commission
    newWeek.bpo = bpo

    var target = Math.round(((newWeek.weeklyhours / oldWeekhours) * oldWeektarget))
    var strech = Math.round(((newWeek.weeklyhours / oldWeekhours) * oldWeekStrech))

    newWeek.target = target
    newWeek.strech = strech

    if(newWeek.totalSubs == 0 && newWeek.weeklyhours == 0){
        newWeek.weeklyAchieved = "Black"
    }else if(totalSubs >= target){
        newWeek.weeklyAchieved = "Yellow"
        if(totalSubs >= strech){
            newWeek.weeklyAchieved = "Green"
        }
    }else {
        newWeek.weeklyAchieved = "Red"
    }

    newWeek = await newWeek.save()

    if(weeklySales._id != null){
        await WeeklySales.findByIdAndDelete(weeklySales._id)
    }
}

async function userLogSale(a, user, inac, itnac, imbb, itmbb, ihup, ifdp, iacc, imc, ibpo, stringValue, logSale, iexpress){

    if(stringValue == "add"){
        logSale.action = "Added Sale"
    }else if(stringValue == "return"){
        logSale.action = "Returned Sale"
    }

    if(iexpress > 0){
        logSale.express = iexpress
    }
    if(inac > 0){
        logSale.nac = inac
    }
    if(itnac > 0){
        logSale.termNac = itnac
    }
    if(imbb > 0){
        logSale.mbb = imbb
    }
    if(itmbb > 0){
        logSale.termMbb = itmbb
    }
    if(ihup > 0){
        logSale.hup = ihup
    }
    if(ifdp > 0){
        logSale.fdp = ifdp
    }
    if(imc > 0){
        logSale.mc = imc
    }
    if(iacc > 0){
        logSale.acc = iacc
    }
    if(ibpo > 0){
        logSale.bpo = ibpo
    }

    logSale= await logSale.save()
}
//#endregion


app.listen(process.env.PORT || 5000)