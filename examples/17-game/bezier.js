class Area{

    constructor(ctx, canvas){
        this.ctx = ctx
        this.canvas = canvas
        this.colour = "#000000"
        this.selected
        this.curves = []
        this.rect = canvas.getBoundingClientRect()
        this.offsetX = this.rect.left
        this.offsetY = this.rect.top
        this.dragok = false
        this.startX
        this.startY
        this.newCurve()
        this.canvas.addEventListener('mousedown', this.mouseDown.bind(this))
        this.canvas.addEventListener('mousemove', this.mouseMove.bind(this))
        this.canvas.addEventListener('mouseup', this.mouseUp.bind(this))
    }

    drawSelected(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
        for (let i = 0; i<this.curves.length; i++){
            if(this.curves[i]!=undefined){
                for (let j = 0; j<this.curves[i].iter; j++){
                    this.curves[i].drawCurve(ctx,j)
                    this.curves[i].iter--
                }
            }
            if(this.selected==this.curves[i] && this.selected.points!=[]){
                    for (let j = 0; j<this.selected.points.length; j++){
                    this.selected.points[j].drawPoint(ctx)
                }
                    for (let j = 0; j<this.selected.lines.length; j++){
                    this.selected.lines[j].drawLine(ctx)
                }
            }
        }
    }

    newCurve(){
        this.colour = "#000000"
        document.getElementById("colour").value = this.colour
        this.selected = new Curve(this.colour)
        this.curves.push(this.selected)
        const sel = document.getElementById("curves")
        const option = document.createElement("option")
        const num = this.curves.length
        option.text = "Krivulja " + num
        option.value = num.toString()
        sel.add(option)
        sel.selectedIndex = (sel.length-1)
        this.drawSelected()
    }

    createPoint(event) {
        let x = event.clientX - this.rect.left
        let y = event.clientY - this.rect.top
        let point
        if(this.selected.stTock==0 || this.selected.stTock==3 || 
        (this.selected.stTock>4 && this.selected.lepiKrivulje==true && (this.selected.stTock-3)%3==0)){
            point = new Point(x,y,"s")
            point.drawPoint(this.ctx)
            this.selected.points.push(point)
        }
        else if((this.selected.stTock>4 && this.selected.lepiKrivulje==true && (this.selected.stTock-4)%3==0) || this.selected.stTock==4){
            let distX = this.selected.points[(this.selected.iter*3)+0].x - this.selected.secondLast.x
            let distY = this.selected.points[(this.selected.iter*3)+0].y - this.selected.secondLast.y
            let mirrorX = this.selected.points[(this.selected.iter*3)+0].x + distX
            let mirrorY = this.selected.points[(this.selected.iter*3)+0].y + distY
            point = new Point(mirrorX,mirrorY,"r")
            point.drawPoint(this.ctx)
            this.selected.points.push(point)
            let line = new Line(this.selected.prevPoint,point)
            this.selected.lines.push(line)
            line.drawLine()
            this.selected.prevPoint = point
            this.selected.stTock++
            point = new Point(x,y,"r")
            point.drawPoint(this.ctx)
            this.selected.points.push(point)
        }
        else{
            point = new Point(x,y,"r")
            point.drawPoint(this.ctx)
            this.selected.points.push(point)
        }
        if(this.selected.stTock>0){
            let line = new Line(this.selected.prevPoint, point)
            this.selected.lines.push(line)
            line.drawLine()
        }
        this.selected.prevPoint = point 
    }

    selectCurve(){
        let s = parseInt(document.getElementById("curves").value)-1
        this.selected = this.curves[s]
        this.colour = this.selected.colour
        document.getElementById("colour").value = this.colour
        this.drawSelected()
    }

    deleteCurve(){
        const index = this.curves.indexOf(this.selected);
        delete this.curves[index]
        const sel = document.getElementById("curves")
        sel.remove(sel.selectedIndex)
        let foundNew = false
        for(let i=0; i<this.curves.length;i++){
            if(this.curves[i]!=undefined){
                this.selected = this.curves[i]
                this.colour = this.selected.colour
                document.getElementById("colour").value = this.colour
                foundNew  = true
                break
            }
        }
        if(foundNew==false){
            this.newCurve()
        }
        else{
            this.drawSelected()
        }
    }

    clearCanvas(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
        this.curves = []
        let select = document.getElementById("curves");
        let length = select.options.length;
        for (let i = length-1; i >= 0; i--) {
            select.options[i] = null;
        }
        this.newCurve()
    }

    setColour(){
        this.colour = document.getElementById("colour").value
        this.selected.colour = this.colour
        this.drawSelected()
    }

    mouseDown(e){
        let x = e.clientX - this.offsetX
        let y = e.clientY - this.offsetY
        this.dragok=false
        for(let i=0; i<this.selected.points.length; i++){
            let tocka = this.selected.points[i]
            if(tocka.type=="s"){
                if(x>=(tocka.x-4) && x<=(tocka.x+4) && y>=(tocka.y-4) && y<=(tocka.y+4)){
                    this.dragok=true
                    tocka.isDragging=true
                    this.startX = x
                    this.startY = y
                }
            }
            else{
                let tempX=tocka.x-x
                let tempY=tocka.y-y
                if(tempX*tempX+tempY*tempY<16){
                    this.dragok=true
                    tocka.isDragging=true
                    this.startX = x
                    this.startY = y
                }
            }
        }
    }
    
    mouseMove(e){
        if(this.dragok){
            let x = e.clientX - this.offsetX
            let y = e.clientY - this.offsetY
            let tempX = x-this.startX
            let tempY = y-this.startY
            for(let i=0; i<this.selected.points.length; i++){
                let tocka = this.selected.points[i]
                if(tocka.isDragging==true){
                    tocka.x+=tempX
                    tocka.y+=tempY
                }
            }
            this.drawSelected()
            this.startX=x
            this.startY=y
        }  
    }
    
    mouseUp(){
        for(let i=0;i<this.selected.points.length;i++){
            this.selected.points[i].isDragging=false;
        }
    }
}

class Curve{
    
    constructor(colour){
        this.points = []
        this.colour = colour
        this.stTock = 0
        this.lines = []
        this.iter = 0
        this.prevPoint = NaN
        this.secondLast = NaN
    }

    bezier(t, p0, p1, p2, p3){
        const x = Math.pow((1-t),3)*p0.x + 3*Math.pow((1-t),2)*t*p1.x + 3*(1-t)*Math.pow(t,2)*p2.x + Math.pow(t,3)*p3.x
        const y = Math.pow((1-t),3)*p0.y + 3*Math.pow((1-t),2)*t*p1.y + 3*(1-t)*Math.pow(t,2)*p2.y + Math.pow(t,3)*p3.y
        return {x: x, y: y}
    }

    drawCurve(ctx, it){
        let acc = 0.001
        let	p0 = this.points[(it*3)+0]
        let p1 = this.points[(it*3)+1]
        let p2 = this.points[(it*3)+2]
        let p3 = this.points[(it*3)+3]
      	ctx.beginPath()
        ctx.moveTo(p0.x, p0.y);
      	for (let i=0; i<1; i+=acc){
            let p = this.bezier(i, p0, p1, p2, p3);
            ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = this.colour
        ctx.stroke()
        this.lepiKrivulje=true
        this.secondLast=p2
    	this.iter++
    }
}

class Point{
    
    constructor(x, y, type){
        this.x=x
        this.y=y
        this.type=type
        this.isDragging=false
    }

    drawPoint(ctx){
        if(this.type=="r"){
            ctx.beginPath()
            ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
            ctx.stroke()
            ctx.fillStyle = 'black'
            ctx.fill()
        }
        else{
            ctx.beginPath()
            ctx.fillRect(this.x,this.y,-4,-4)
            ctx.fillStyle = 'black'
            ctx.fill()
            ctx.beginPath()
            ctx.fillRect(this.x,this.y,4,-4)
            ctx.fillStyle = 'black'
            ctx.fill()
            ctx.beginPath()
            ctx.fillRect(this.x,this.y,-4,4)
            ctx.fillStyle = 'black'
            ctx.fill()
            ctx.beginPath()
            ctx.fillRect(this.x,this.y,4,4)
            ctx.fillStyle = 'black'
            ctx.fill()
        }
    }
}

class Line{
    constructor(from, to){
        this.from=from
        this.to=to
    }

    drawLine() {
        ctx.beginPath()
        ctx.moveTo(this.from.x,this.from.y)
        ctx.lineTo(this.to.x,this.to.y)
        ctx.strokeStyle = "silver"
        ctx.stroke()
    }
}