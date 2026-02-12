/** 
@typedef {{
  margin: {
    top: number,
    bottom: number,
    inside: number,
    outside: number,
  }

  columns: number,
  gutter: number,
  
  hanglines: number[]
  page_width: number,
  page_height: number,
}} GridProps
*/
export class Grid {
  /**
  @param {GridProps} props
  */
  constructor(props) {
    this.props = props
  }

  hanglines() {
    return this.props.hanglines
  }

  set_margin(margin) {
    this.props.margin = margin
  }

  /**@returns {{x:number, y:number, w:number, h: number}[]}*/
  recto_columns() {
    /**@type {{x:number, y:number, w:number, h: number}[]}*/
    const cols = []

    for (let i = 0; i < this.props.columns; i++) {
      const y = this.props.margin.top
      const w = this.column_width()

      // outside + gutters + size
      const x = this.half_page().x + this.props.margin.inside + i * this.props.gutter + i * this.column_width();
      const h = this.props.page_height
						- (this.props.margin.top + this.props.margin.bottom)

      cols.push({ x, y, w, h })
    }

    return cols
  }

  /**@returns {{x:number, y:number, w:number, h: number}[]}*/
  verso_columns() {
    /**@type {{x:number, y:number, w:number, h: number}[]}*/
    const cols = []

    for (let i = 0; i < this.props.columns; i++) {
      const y = this.props.margin.top
      const w = this.column_width()

      // outside + gutters + size
      const x = this.props.margin.outside + i * this.props.gutter + i * this.column_width();
      const h = this.props.page_height
						- (this.props.margin.top + this.props.margin.bottom)

      cols.push({ x, y, w, h })
    }

    return cols
  }

  columns() { return [this.verso_columns(), this.recto_columns()] }
  columns_combined() { return [...this.verso_columns(), ...this.recto_columns()] }

  /**@returns {Unit}*/
  column_width(n = 1) {
    let w = this.half_page().x - (this.props.margin.inside + this.props.margin.outside);
    let g = (n - 1) * this.props.gutter
    return ((w - (this.props.gutter * (this.props.columns - 1))) / this.props.columns) * n + g;
  }

  /**@returns {{x: Unit, y: Unit}}*/
  half_page() {
    return {
      x: this.props.page_width / 2,
      y: this.props.page_height /2
    }
  }
}
