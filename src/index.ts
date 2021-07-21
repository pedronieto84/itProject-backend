import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const cors = require('cors')({origin: true});
//import * as moment from 'moment'

admin.initializeApp(functions.config().firebase)
//const auth = admin.auth();
const db = admin.firestore();


enum State{
    'published', 'accepted', 'refused', 'doing', 'finished', 'charged'
}

interface User{
    userId:string;
    name: string;
    email: string;
    password: string;
    verified: string;
    projectsPublished:string[]
    admin?:boolean
}

interface Project{
    title: string;
    projectId:string;
    ownerId: string;
    publishedDate: Date;
    deadline?: Date;
    techSet?:string[];
    filesArray?: string[];
    shortExplanation: string;
    state: State
}

// added stupid comment

// prueba en branch prueba

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
export const getProjects = functions.https.onRequest(async ( request, response ) => {
        cors(request, response, async ()=>{
           response.set('Access-Control-Allowed-Origin', '*')
            const data = await db.collection('itAcademyProjects').get();
            const whatToReturn = data.docs.map( (eachDoc)=> { return eachDoc.data() }) as Project[]
            response.status(200).send(whatToReturn);
        })
});

export const getTechSet = functions.https.onRequest(async ( request, response ) => {
    cors(request, response, async ()=>{
       response.set('Access-Control-Allowed-Origin', '*')
        const data = await db.collection('itAcademyTechSet').get();
        const whatToReturn = data.docs.map( (eachDoc)=> { return eachDoc.data() }) as any[]
        response.status(200).send(whatToReturn);
    })
});

export const getUsers = functions.https.onRequest(async ( request, response ) => {
    cors(request, response, async ()=>{
       response.set('Access-Control-Allowed-Origin', '*')
        const data = await db.collection('itAcademyUsers').get();
        const whatToReturn = data.docs.map( (eachDoc)=> { return eachDoc.data() }) as User[]
        response.status(200).send(whatToReturn);
    })
});

export const getProject = functions.https.onRequest(async ( request, response ) => {
    cors(request, response, async ()=>{
        const projectId = request.body.projectId
        console.log('projectId', projectId)
        response.set('Access-Control-Allowed-Origin', '*')
        const data = await db.collection('itAcademyProjects').doc(projectId).get();
        if(data.exists){
            const resp = data.data()
            response.status(200).send(resp);
        }else{
        
            response.status(401).send({ error: 'Aquest projecte no existeix' })
        }
     
    })
});

export const getUser = functions.https.onRequest(async ( request, response ) => {
    cors(request, response, async ()=>{
        const userId = request.body.userId;
        console.log('userId', userId)
        response.set('Access-Control-Allowed-Origin', '*')
        const data = await db.collection('itAcademyUsers').doc(userId).get();
        if(data.exists){
            const resp = data.data()
            response.status(200).send(resp);
        }else{
            response.status(401).send({error: 'Aquest usuari no existeix'})
        }
        
    })
});

export const createProject = functions.https.onRequest(async ( request, response ) => {
    cors(request, response, async ()=>{
        const dataToAdd = request.body;
    response.set('Access-Control-Allowed-Origin', '*')
    console.log('data to add', dataToAdd)
    const data = await db.collection('itAcademyProjects').add(dataToAdd)
    const id = data.id;
    console.log('id', id)
    await db.collection('itAcademyProjects').doc(id).set({projectId: id}, {merge: true})
    response.status(200).send({projectId: id});
    })
});

export const createUser = functions.https.onRequest(async ( request, response ) => {
cors(request, response, async ()=>{
    const dataToAdd = request.body;
   response.set('Access-Control-Allowed-Origin', '*')
    const data = await db.collection('itAcademyUsers').add(dataToAdd)
    const id = data.id;
    await db.collection('itAcademyUsers').doc(id).set({userId: id}, {merge: true})
    response.status(200).send({userId: id});
})
});

export const updateProject = functions.https.onRequest(async ( request, response ) => {
    cors(request, response, async ()=>{
        const dataToAdd = request.body;
        response.set('Access-Control-Allowed-Origin', '*')
        await db.collection('itAcademyProjects').doc(dataToAdd.projectId).set(dataToAdd, {merge: true})
        response.status(200).send({projectId: dataToAdd.projectId});
    })
});

export const updateUser = functions.https.onRequest(async ( request, response ) => {
cors(request, response, async ()=>{
        const dataToAdd = request.body;
        response.set('Access-Control-Allowed-Origin', '*')
        await db.collection('itAcademyUsers').doc(dataToAdd.userId).set(dataToAdd, {merge: true})
        response.status(200).send({userId: dataToAdd.userId});
})
});

export const deleteProject = functions.https.onRequest(async ( request, response ) => {
    cors(request, response, async ()=>{
        const dataToAdd = request.body
        response.set('Access-Control-Allowed-Origin', '*');
        console.log('projectId', dataToAdd)
        try{
            const exists = await db.collection('itAcademyProjects').doc(dataToAdd.projectId).get()
            console.log('exists', exists.exists)
            await db.collection('itAcademyProjects').doc(dataToAdd.projectId).delete()
            response.status(200).send({ projectId: dataToAdd });
        }catch(e){
            console.error('project not exist', e);
            response.status(404).send({error: 'Aquest projecte no existeix' })
        }
      
    })
});

export const deleteUser = functions.https.onRequest(async ( request, response ) => {
cors(request, response, async ()=>{
        const dataToAdd = request.body
        response.set('Access-Control-Allowed-Origin', '*')
        try{
            await db.collection('itAcademyUsers').doc(dataToAdd.userId).delete()
            response.status(200).send({ userId: dataToAdd.userId });
        }catch(e){
            console.error('project not exist', e);
            response.status(404).send({error: 'Aquest user no existeix' })
        }
})
});

// comentario tonto de prueba

export const login = functions.https.onRequest(async ( request, response ) => {
    cors(request, response, async ()=>{
        console.log('body', request.body);
        
            const {email, password } = request.body;
            console.log('email', email)
            console.log('password', password)
            const doc = await db.collection('itAcademyUsers').where('email', '==', email)
            .where('password','==',password).get();
            if(doc.empty){
                response.status(401).send({error: 'Email o password son incorrectes'});
            }else{
                response.status(200).send({user: doc.docs[0].data()});
            }
    })
    });

