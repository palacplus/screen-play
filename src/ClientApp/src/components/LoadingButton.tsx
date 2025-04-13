import { Rings } from 'react-loader-spinner'

interface ButtonProps {
    loading: boolean,
    onClick?: (event: React.FormEvent) => void,
    title: string,
    testId?: string
    type: "submit" | "reset" | "button" | undefined
}

export default function LoadingButton(props: ButtonProps) {
    return (
        <button onClick={props.onClick} type={props.type} data-testid={props.testId} >
            {props.loading && props.title}
            {props.loading && <Rings color='#0d061d' height={12}/>}
        </button>
    )
}