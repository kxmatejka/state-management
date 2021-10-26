import create from 'zustand'
import produce from 'immer'
import type {Immutable} from 'immer'

type AnimalType = 'bear' | 'tiger' | 'camel'

type Animal = {
  id: string
  name: string
  type: AnimalType
  votes: number
}

type UnsavedAnimal = Omit<Animal, 'id' | 'votes'>

type Store = Immutable<{
  general: {
    animals: Animal[]
  }
  addForm: {
    name: string
    type: AnimalType
    setName: (name: string) => void
    setType: (type: AnimalType) => void
    addAnimal: (animal: UnsavedAnimal) => void
  }
}>

const createGeneralAnimalStore = (set) => ({
  general: {
    animals: [],
    increaseAnimalVotes: (id: string) => set(produce<Store>((draft) => {
      const votedAnimalIndex = draft.general.animals.findIndex((animal) => animal.id === id)
      draft.general.animals[votedAnimalIndex].votes++
    })),
  },

})

const createAddAnimalFormStore = (set) => ({
  addForm: {
    name: '',
    type: 'bear' as AnimalType,
    setName: (name: string) => set(produce<Store>((draft) => {
      draft.addForm.name = name
    })),
    setType: (type: AnimalType) => set(produce<Store>((draft) => {
      draft.addForm.type = type
    })),
    addAnimal: (animal: UnsavedAnimal) => set(produce<Store>((draft) => {
      draft.general.animals.push({...animal, id: String(draft.general.animals.length + 1), votes: 0})
      draft.addForm.name = ''
      draft.addForm.type = 'bear'
    })),
  },
})

const useStore = create((set) => ({
  ...createGeneralAnimalStore(set),
  ...createAddAnimalFormStore(set),
}))

const AnimalForm = () => {
  const {
    name, type, setName, setType, addAnimal,
  } = useStore((state) => state.addForm)


  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault()
        addAnimal({name, type})
      }}>
        <div>
          <label>
            Name:
            <input value={name} onChange={(e) => setName(e.target.value)}/>
          </label>
        </div>
        <div>
          <select value={type} onChange={(e) => setType(e.target.value as AnimalType)}>
            <option value='bear'>Bear</option>
            <option value='tiger'>Tiger</option>
            <option value='camel'>Camel</option>
          </select>
        </div>
        <div>
          <button type='submit'>Submit</button>
        </div>
      </form>
    </div>
  )
}

const AnimalFormChecker = () => {
  const {
    name, type,
  } = useStore((state) => state.addForm)

  return (
    <div>
      <strong>Adding animal:</strong>
      <input value={name} disabled/>
      <input value={type} disabled/>
    </div>
  )
}

const AnimalList = () => {
  const {animals, increaseAnimalVotes} = useStore((state) => state.general)
  const sortedAnimals = [...animals].sort((a, b) => b.votes - a.votes)

  return (
    <ul>
      {sortedAnimals
        .map((animal) => (
          <li key={animal.id}>{animal.name} ({animal.type}) <span onClick={() => increaseAnimalVotes(animal.id)}>({animal.votes}++)</span></li>
        ))}
    </ul>
  )
}

const AnimalTracker = () => {
  return (
    <>
      <h1>Animal Tracker</h1>
      <AnimalForm/>
      <AnimalFormChecker/>
      <AnimalList/>
    </>
  )
}

export default AnimalTracker
