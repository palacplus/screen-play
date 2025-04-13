export function FormErrors(props: {errors?: string[], color?: string}){
    if(!props.errors?.length) return null;
    return <div>{<span key={0} style={{ display: 'block', textAlign: 'center', color : props.color ? props.color : 'red'}}>{props.errors[0]}</span>}</div>
  }