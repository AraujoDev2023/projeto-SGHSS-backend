 // Classe prontuario
 export default class medicalRecord {
    #recordId
    #patientId
    #professionalId
    #recordDate
    #diagnosis
    #symptoms
    #medications
    #notes
    constructor(    
        recordId,
        patientId,
        professionalId,
        recordDate,
        diagnosis,
        symptoms,
        medications,
        notes
    ){
        this.#recordId = recordId;
        this.#patientId = patientId;
        this.#professionalId = professionalId;
        this.#recordDate = recordDate;
        this.#diagnosis = diagnosis;
        this.#symptoms = symptoms;
        this.#medications = medications;
        this.#notes = notes;
    }

    // Getters
    get recordId() { return this.#recordId; }
    get patientId() { return this.#patientId; }
    get professionalId() { return this.#professionalId; }
    get recordDate() { return this.#recordDate; }
    get diagnosis() { return this.#diagnosis; }
    get symptoms() { return this.#symptoms; }
    get medications() { return this.#medications; }
    get notes() { return this.#notes; }
 }