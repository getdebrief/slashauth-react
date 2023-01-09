import styleModule from './loader.module.css';

export const Loader = ({ color, size }) => {
  return (
    <div className={styleModule.loader} style={{ fontSize: size }}>
      <span
        className={styleModule.circle}
        style={{ background: color }}
        id={styleModule.left}
      ></span>
      <span
        className={styleModule.circle}
        style={{ background: color }}
        id={styleModule.center}
      ></span>
      <span
        className={styleModule.circle}
        style={{ background: color }}
        id={styleModule.right}
      ></span>
    </div>
  );
};
