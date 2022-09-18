import { useRouter } from '../router/context';

type Props = React.HTMLProps<HTMLAnchorElement> & {
  to?: string;
};

export const RouterLink = (props: Props) => {
  const { to, onClick: onClickProp, href, ...rest } = props;
  const router = useRouter();

  const toUrl = router.resolve(to || router.indexPath);

  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    if (onClickProp && !to) {
      return onClickProp(e);
    }
    return router.navigate(toUrl.href);
  };

  return (
    <a {...rest} onClick={onClick} href={to}>
      {rest.children}
    </a>
  );
};
