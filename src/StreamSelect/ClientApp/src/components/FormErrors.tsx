export function FormErrors(props: {errors?: string[], color?: string}){
    if(!props.errors?.length) return null;
    return <div style={{color : props.color ? props.color : 'red' }}>{<span key={0} style={{ display: 'block', textAlign: 'center' }}>{props.errors[0]}</span>}</div>
  }