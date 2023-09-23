const sleep = async (time) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

abstract class Sprite {
  getSprite(orientation: string, spriteNumber: number) {}
  
  updateSpriteNumber() {}
  
  animate() {}
}


abstract class Entity {
  private _positionXY: [number, number]
  private _onMove: (destination: [number, number]) => void
  public HTMLElement: HTMLDivElement = document.createElement('div')
  public isMoving: boolean = false
  public movingOrientation: 'top' | 'bottom' | 'left' | 'right' = 'left'
  public sprite: any = null;
  
  protected constructor(
    positionXY: [number, number],
  ) {
    this._positionXY = positionXY
    this.sprite = null
  }
  
  get positionXY() {
    return this._positionXY
  }
  
  set positionXY(positionXY: [number, number]) {
    this._positionXY = positionXY
  }
  
  get onMove() {
    return this._onMove
  }
  
  set onMove(onMove: (destination: [number, number]) => void) {
    this._onMove = onMove
  }
  
  move(destination: [number, number]) {
    const [destinationX, destinationY] = destination
    const [initialX, initialY] = this.positionXY
    this.setInitialOrientation(initialX, destinationX, initialY, destinationY);
  
    const interval = setInterval(() => {
      const [currentX, currentY] = this.positionXY
      const arrivedX = destinationX === currentX
      const arrivedY = destinationY === currentY
      const arrived = arrivedX && arrivedY
      
      if (arrived) {
        clearInterval(interval)
      }
      
      const placesToMove = 1
      
      let newY = currentY
      let newX = currentX
      
      if (!arrivedX) {
        const needToMoveLeft = destinationX < currentX
        
        const moveToLeft = currentX - placesToMove
        const moveToRight = currentX + placesToMove
        newX = needToMoveLeft ? (() => {
          this.movingOrientation = 'left'
          return moveToLeft
        })() : (() => {
          this.movingOrientation = 'right'
          return moveToRight
        })()
        this.positionXY = [newX, newY]
        this.onMove(this.positionXY)
      } else if (!arrivedY) {
        const needToMoveTop = destinationY < currentY
  
        const moveToTop = currentY - placesToMove
        const moveToBottom = currentY + placesToMove
  
        newY = needToMoveTop ? (() => {
          this.movingOrientation = 'top'
          return moveToTop
        })() : (() => {
          this.movingOrientation = 'bottom'
          return moveToBottom
        })()
        this.positionXY = [newX, newY]
        this.onMove(this.positionXY)
      } else {
        this.isMoving = false
        const cellKey = `cell-${destinationX}-${destinationY}`
        const cellToPut = document.getElementById(cellKey)
        cellToPut.classList.remove('cell--selected')
        clearInterval(interval)
      }
    }, 600)
  }
  
  private setInitialOrientation(initialX: number, destinationX: number, initialY: number, destinationY: number) {
    if (initialX > destinationX) {
      this.movingOrientation = 'left'
    } else if (initialX < destinationX) {
      this.movingOrientation = 'right'
    }
    
    if (initialY > destinationY) {
      this.movingOrientation = 'top'
    } else if (initialY < destinationY) {
      this.movingOrientation = 'bottom'
    }
    this.sprite.toggleSprite()
  }
  
  onRender(space: Space) {}
  
  setSprite(sprite: Sprite) {
    this.sprite = sprite
  }
  
  render(space: Space) {
    this.onRender(space)
    space.putEntity(this)
  }
}


class ChampionSprite extends Sprite {
  private defaultSpriteStopped: number = 2
  private entity: Entity
  private spriteNumber: number
  private spriteIsFinal: boolean = false
  
  constructor(entity: Entity) {
    super()
    this.entity = entity
    this.spriteNumber = this.defaultSpriteStopped
  }
  
  getSprite(orientation: string, spriteNumber: number) {
    return `entitySprite__${orientation}_${spriteNumber}`
  }
  
  updateSpriteNumber() {
    if (this.spriteNumber === 3) {
      this.spriteIsFinal = true
    }
    if (this.spriteNumber === 1) {
      this.spriteIsFinal = false
    }
    
    const toggleSpriteNumbers = this.spriteIsFinal ? {
      3: 2,
      2: 1,
    } : {
      1: 2,
      2: 3
    }
    
    this.spriteNumber = this.entity.isMoving ? toggleSpriteNumbers[this.spriteNumber] : this.defaultSpriteStopped
  }
  
  toggleSprite() {
    this.updateSpriteNumber()
    const entityOrientation = this.entity.movingOrientation
  
    const sprite = this.getSprite(entityOrientation, this.spriteNumber)
    this.entity.HTMLElement.className = this.entity.HTMLElement.className.split(" ").filter((className: string) => !className.includes("entitySprite")).join(" ")
    this.entity.HTMLElement.classList.add(sprite)
  }
  
  animate() {
    this.toggleSprite()
    setInterval(() => {
      if (this.entity.isMoving) {
        this.toggleSprite()
      }
    }, 150)
  }
}

class Champion extends Entity {
  constructor(
    public name: string,
    
    positionXY: [number, number],
  ) {
    super(positionXY)
    this.name = name
  }
  
  onRender(space: Space) {
    this.HTMLElement.classList.add('champion')
    const nameAboveChampion = document.createElement('span')
    nameAboveChampion.classList.add('champion__name')
    nameAboveChampion.innerText = this.name
    this.HTMLElement.appendChild(nameAboveChampion)
  }
}


class Space {
  private matrixSpace: string[][] = [
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
    ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
  ]
  
  constructor(
    public root: HTMLElement,
    public mainEntity: Entity = null,
  ) {
    this.root = root
    this.mainEntity = mainEntity
  }
  
  putEntity(entity: Entity) {
    const [x, y] = entity.positionXY
    const cellKey = `cell-${x}-${y}`
    const cellToPut = document.getElementById(cellKey)
    if (cellToPut) {
      cellToPut.appendChild(entity.HTMLElement)
    }
  }
  
  render() {
    const matrixSpace = this.matrixSpace
    const spaceElement = this.createSpaceElement()
    matrixSpace.forEach((row, rowIndex) => {
      this.createAndRenderRow(spaceElement, row, rowIndex)
    })
    
    this.root.appendChild(spaceElement)
    this.configureMainEntityIfExists()
  }
  
  private configureMainEntityIfExists() {
    if (this.mainEntity) {
      this.mainEntity.onMove = this.onMoveMainEntity.bind(this)
      this.mainEntity.render(this)
    }
  }
  
  private createSpaceElement() {
    const spaceElement = document.createElement('section')
    spaceElement.classList.add('space')
    return spaceElement;
  }
  
  private createAndRenderCell(coordinates: [number, number], rowElement: HTMLOListElement) {
    const cellElement = document.createElement('li')
    cellElement.classList.add('cell')
    cellElement.id = `cell-${coordinates[0]}-${coordinates[1]}`
    
    if (this.mainEntity) {
      cellElement.addEventListener('click', () => {
        if (this.mainEntity.isMoving) {
          return
        }
        this.mainEntity.move(coordinates)
  
        cellElement.classList.add('cell--selected')
      })
    }
    
    rowElement.appendChild(cellElement)
  }
  
  private createAndRenderRow(spaceElement: HTMLElement, row: string[], rowIndex: number) {
    const rowElement = document.createElement('ol')
    rowElement.classList.add('row')
    
    row.forEach((cell, cellIndex) => {
      this.createAndRenderCell([cellIndex, rowIndex], rowElement)
    })
    
    spaceElement.appendChild(rowElement)
  }
  
  private async onMoveMainEntity(destination: [number, number]) {
    const [destinationX, destinationY] = destination
    const cellKey = `cell-${destinationX}-${destinationY}`
    const cellToPut = document.getElementById(cellKey)
    
    if (cellToPut) {
      this.mainEntity.isMoving = true
      this.animateMoveByOrientation("add")
      await sleep(540)
      this.animateMoveByOrientation("remove")
      cellToPut.appendChild(this.mainEntity.HTMLElement)
    }
  }
  
  private animateMoveByOrientation(param: string) {
    const orientation = this.mainEntity.movingOrientation
    this.mainEntity.HTMLElement.classList[param](`championMove--${orientation}`)
  }
}

const root = document.getElementById('root')
const luana = new Champion('Luana', [0, 0])
const luanaSprite = new ChampionSprite(luana)
luana.setSprite(luanaSprite)
luana.sprite.animate()
const space = new Space(root, luana)
space.render()
