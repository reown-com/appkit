export default function Gradient() {
  return (
    <div className="h-d-screen absolute top-0 left-0 h-full w-full -z-10">
      <div
        className="absolute w-full h-full -z-10 opacity-30"
        style={{
          background: 'radial-gradient(circle at 40% 100%, #5BFF6C, transparent 40%)'
        }}
      />
      <div
        className="absolute w-full h-full -z-10 opacity-30"
        style={{
          background:
            'radial-gradient(circle at 61.0647% 52.5025%, rgb(154, 170, 255), transparent 60%)'
        }}
      />
      <div
        className="absolute w-full h-full -z-20 opacity-30"
        style={{
          background: 'rgb(240,240,240)'
        }}
      />
    </div>
  )
}
