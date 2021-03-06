import {useRequest} from 'ahooks';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {
  FC,
  useEffect,
  useState,
  memo,
  ChangeEvent,
  useRef,
  useContext,
} from 'react';
import {useRecoilState} from 'recoil';

import {
  HeaderContainer,
  HeaderLogoContainer,
  HeaderOptionContainer,
  HeadeUserContainer,
  HeadeSearchContainer,
  WalletListContainer,
  UserListContainer,
  WalletItemContainer,
  UserItemContainer,
  SearchLists,
  SearchTabs,
  WalletContainer,
  SearchList,
} from './styles';

import {DropDown, Loading, Auth} from '@/components';
import {RouterPath} from '@/config/routes';
import {useMetaMask, useEthersUtils, Web3ProviderContext} from '@/ethers-react';
import {getSearchAuthor, getSearchImage, getSearchNft} from '@/services/search';
import {getLoginNonce, onLogin, onLogout} from '@/services/user';
import {userState} from '@/store/user';
import {userDrawerState} from '@/store/userDrawer';
import {Button, IconInput, SvgIcon} from '@/uikit';
import {showTip, IMessageType} from '@/utils';

export const Header: FC = memo(() => {
  const router = useRouter();
  const [user, _setUser] = useRecoilState(userState);
  const [_userDrawer, setUserDrawer] = useRecoilState(userDrawerState);

  // εε»Ίεε
  const handleCreateClick = () => {
    router.push(RouterPath.Create);
  };

  return (
    <HeaderContainer>
      <HeaderLogoContainer>
        <Link passHref href='/'>
          <a>
            <SvgIcon height={40} name='logo' width={126} />
          </a>
        </Link>
      </HeaderLogoContainer>
      <HeaderOptionContainer>
        <SearchInput />
        <Auth>
          <Button
            height={32}
            marginLeft={47}
            variant='primary'
            width={80}
            onClick={handleCreateClick}
          >
            Create
          </Button>
        </Auth>
        <DropDown OptionsNode={<User />}>
          <HeadeUserContainer>
            {user.token ? (
              <Image
                alt='Wallet'
                height={32}
                src={
                  user.portrait
                    ? user.portrait
                    : '/static/icon/avatar-icon1.png'
                }
                width={32}
              />
            ) : (
              <SvgIcon
                color='#333333'
                height={32}
                name='user-icon'
                width={32}
              />
            )}
          </HeadeUserContainer>
        </DropDown>
        <WalletContainer
          onClick={() => {
            setUserDrawer({
              open: !_userDrawer.open,
            });
          }}
        >
          <SvgIcon color='#333333' height={32} name='wallet-icon' width={32} />
        </WalletContainer>
      </HeaderOptionContainer>
    </HeaderContainer>
  );
});
Header.displayName = 'Header';

export enum searchType {
  IMAGE = 'Image',
  AUTHOR = 'Author',
  NFT = 'NFT',
}

const SearchInput = memo(({children}) => {
  const searchNumber = 8;
  const router = useRouter();
  const [showSearchResult, setshowSearchResult] = useState(false);
  const {search, type} = router.query;
  const [tabType, settabType] = useState<searchType>(searchType.IMAGE);
  const [value, setValue] = useState('');
  let [choose, setChoose] = useState(-1);
  const [oldValue, setoldValue] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  // θ·εε½εdomθηΉ
  const selectRef: any = useRef(null);
  /**
   * ε€ζ­ηΉε»ηζ―listεθ‘¨θΏζ―ε€ι¨domε?η°ιθζη΄’εε?Ή
   * @param e
   */
  const clickCallback = (e: any) => {
    if (selectRef.current && selectRef.current.contains(e.target)) {
      return;
    }
    setshowSearchResult(false);
  };

  /**
   * εζ’ζη΄’η±»ε
   * @searchType
   */
  const handleTabClick = (type: searchType) => {
    settabType(type);
    setshowSearchResult(false);
    router.push(RouterPath.search((value || search) as string, type));
  };
  /**
   * ζΉεζη΄’ζ‘
   * @e
   */
  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setshowSearchResult(false);
    }
    setValue(e.target.value);
    setoldValue(e.target.value);
    setSearchLoading(true);
    setChoose(-1);
    run();
  };

  /**
   * θη¦
   *
   */
  const onFocus = () => {
    run();
  };
  /**
   * enterθ·³θ½¬
   * @e
   */
  const onKeyDown = (
    e: KeyboardEvent | React.KeyboardEvent<HTMLInputElement>
  ) => {
    const chooseFn = () => {
      if (choose === -1) {
        setValue(oldValue);
      } else {
        const value =
          data[choose].title || data[choose].username || data[choose].name;
        setValue(value);
      }
      setChoose(choose);
    };
    // enterι?
    if (e.keyCode === 13) {
      if (value === '') {
        // ζη΄’ζ‘δΈΊη©ΊθΏει¦ι‘΅
        router.push('/');
      } else {
        searchMore();
      }
    }
    // δΈι?
    if (e.keyCode === 38) {
      if (!data || data.length === 0) {
        return;
      }
      const max = data.length;
      if (choose < 0) {
        choose = max - 1;
      } else {
        choose -= 1;
      }
      chooseFn();
    }
    // δΈι?
    if (e.keyCode === 40) {
      if (!data || data.length === 0) {
        return;
      }
      const max = data.length;
      if (choose >= max - 1) {
        choose = -1;
      } else {
        choose += 1;
      }
      chooseFn();
    }
    // ESC
    if (e.keyCode === 27) {
      setshowSearchResult(false);
    }
  };
  /**
   * θ·εζη΄’η»ζ
   *
   */
  const getSerachRes = async () => {
    if (!value) {
      return;
    }
    setshowSearchResult(true);
    setSearchLoading(true);
    let result = [];
    if (tabType === searchType.IMAGE) {
      const res: any = await getSearchImage({
        title: value,
        page: 1,
        pageSize: searchNumber,
      });
      if (res.code === 0) {
        result = res.data.infoList;
      }
    }
    if (tabType === searchType.AUTHOR) {
      const res: any = await getSearchAuthor({
        title: value,
        page: 1,
        pageSize: searchNumber,
      });
      if (res.code === 0) {
        result = res.data.infoList;
      }
    }
    if (tabType === searchType.NFT) {
      const res: any = await getSearchNft({
        title: value,
        page: 1,
        pageSize: searchNumber,
      });
      if (res.code === 0) {
        result = res.data.infoList;
      }
    }
    setSearchLoading(false);
    return result;
  };
  /**
   * ι²ζζη΄’
   * @e
   */
  const {data, run} = useRequest(getSerachRes, {
    debounceWait: 200,
    manual: true,
  });

  /**
   * ηΉε»ζη΄’εε?Ήθ·³θ½¬
   * @param value
   */
  const onClickList = (value: any) => {
    if (tabType === searchType.IMAGE) {
      router.push(RouterPath.worksDetail(value.id));
    }
    if (tabType === searchType.AUTHOR) {
      router.push(RouterPath.profile(value.uuid));
    }
    if (tabType === searchType.NFT) {
      router.push(RouterPath.project(value.typeId, value.name));
    }
    // router.push(RouterPath.search((value || search) as string, tabType));
    setValue('');
    // ηΉε»ειθζη΄’εε?Ή
    setshowSearchResult(false);
  };
  /**
   *
   * ηε¬valueεε
   */
  useEffect(() => {
    if (value) {
      document.addEventListener('click', clickCallback, false);
    }
    return () => {
      document.removeEventListener('click', clickCallback, false);
    };
  }, [value]);
  /**
   *
   * ηε¬ζη΄’εε?Ήεε
   */
  useEffect(() => {
    // εζ’ι‘΅ι’ε°valueγtypeη½?δΈΊι»θ?€
    if (router.pathname !== '/search') {
      setValue('');
      settabType(searchType.IMAGE);
      setshowSearchResult(false);
      return;
    }
    // ε·ζ°ι‘΅ι’οΌζ Ήζ?θ·―η±δΏε­εζ°
    if (search && !value) {
      setValue((search as string) + window.location.hash);
      setoldValue((search as string) + window.location.hash);
    }
    if (type === searchType.IMAGE || !search) {
      settabType(searchType.IMAGE);
    }
    if (type === searchType.AUTHOR) {
      settabType(searchType.AUTHOR);
    }
    if (type === searchType.NFT) {
      settabType(searchType.NFT);
    }
  }, [search, type, router.pathname]);

  /**
   *
   * ιΌ ζ η»θΏε θζ―θ²
   */
  const onMouseOver = (index: number) => {
    setChoose(index);
  };
  /**
   *
   * ιΌ ζ η¦»εΌε»ι€θζ―θ²
   */
  const onMouseOut = () => {
    setChoose(-1);
  };
  /**
   * ε°ζε?ε­η¬¦δΈ²ε η²
   * @param wholestrε­η¬¦δΈ²,destrζε?ε η²ε­η¬¦
   */
  const becomeStrong = (wholestr: string, destr: string) => {
    const start = wholestr.toUpperCase().indexOf(destr.toUpperCase());
    let html = wholestr;
    if (start !== -1) {
      const end = start + destr.length;
      const last = wholestr.length;
      html = `${wholestr.slice(
        0,
        start
      )}<span style="color: #000;font-family: HarmonyOs-Bold;">${wholestr.slice(
        start,
        end
      )}</span>${wholestr.slice(end, last)}`;
    }
    return {__html: html};
  };
  const searchMore = () => {
    router.push(RouterPath.search((value || search) as string, tabType));
    setshowSearchResult(false);
  };
  return (
    <HeadeSearchContainer ref={selectRef}>
      <IconInput
        border='1px solid #EEF0F2'
        borderRadius={24}
        className='inputStyle'
        height={48}
        leftIcon={
          <SvgIcon color='#989898' height={24} name='search-icon' width={24} />
        }
        paddingLeft={53}
        placeholder='Search Collections'
        value={value}
        onChange={(e) => onChange(e)}
        onClick={onFocus}
        onFocus={onFocus}
        onKeyDown={(e) => {
          onKeyDown(e);
        }}
      />
      {showSearchResult ? (
        <SearchLists onMouseOut={onMouseOut}>
          {searchLoading ? (
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <Loading size='mini' />
            </div>
          ) : data && data.length ? (
            <>
              {data.map((val: any, index: number) => (
                // ι»θ?€ζη΄’Image
                <SearchList
                  className={choose === index ? 'choose' : ''}
                  key={index}
                  onClick={() => {
                    onClickList(val);
                  }}
                  onMouseOver={() => {
                    onMouseOver(index);
                  }}
                >
                  <span className='searchListImg'>
                    <Image
                      alt='image'
                      blurDataURL='/static/icon/copylink-icon.png'
                      layout='fill'
                      placeholder='blur'
                      quality={60}
                      src={
                        imageError
                          ? val.item ||
                            val.portrait ||
                            val.logo ||
                            '/static/icon/logoheader.png'
                          : `${
                              val.item || val.portrait || val.logo
                            }?x-oss-process=image/resize,m_fill,h_32,w_32` ||
                            '/static/icon/logoheader.png'
                      }
                      title='search'
                      onError={() => {
                        setImageError(true);
                      }}
                    />
                  </span>
                  <span
                    dangerouslySetInnerHTML={becomeStrong(
                      val.title || val.username || val.name,
                      value
                    )}
                  />
                </SearchList>
              ))}
              {router.pathname !== '/search' && data.length === searchNumber ? (
                <div className='more' onClick={searchMore}>
                  More
                </div>
              ) : null}
            </>
          ) : (
            <SearchList>No items found</SearchList>
          )}
        </SearchLists>
      ) : null}
      {router.pathname === '/search' ? (
        <SearchTabs>
          <Button
            borderRadius={43}
            height={24}
            marginLeft={16}
            variant={tabType === searchType.IMAGE ? 'primary' : 'text'}
            width={65}
            onClick={() => {
              handleTabClick(searchType.IMAGE);
            }}
          >
            Image
          </Button>
          <Button
            borderRadius={43}
            height={24}
            marginLeft={16}
            variant={tabType === searchType.AUTHOR ? 'primary' : 'text'}
            width={65}
            onClick={() => {
              handleTabClick(searchType.AUTHOR);
            }}
          >
            Author
          </Button>
          <Button
            borderRadius={43}
            height={24}
            marginLeft={16}
            variant={tabType === searchType.NFT ? 'primary' : 'text'}
            width={65}
            onClick={() => {
              handleTabClick(searchType.NFT);
            }}
          >
            NFT
          </Button>
        </SearchTabs>
      ) : null}
      {children}
    </HeadeSearchContainer>
  );
});

SearchInput.displayName = 'SearchInput';

const Wallet = memo(() => {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useRecoilState(userState);
  const {getHashId} = useEthersUtils();
  const {connectWallect} = useMetaMask();
  const {connectedAccount} = useContext(Web3ProviderContext);

  const onloginRequest = async (publicAddress: string) => {
    const res: any = await getLoginNonce({publicAddress});
    const nonce = res.data.nonce || '';
    if (res.code === 0) {
      const signature = getHashId(nonce);
      const res1: any = await onLogin({
        signature,
        publicAddress,
      });
      if (res1.code === 0) {
        const {expiresAt, portrait, token, username, uuid} = res1.data;
        setUser({
          expiresAt,
          portrait,
          token,
          username,
          userId: uuid,
          accountAddress: publicAddress,
        });
        setLoading(false);
        localStorage.setItem('x-token', res1.data.token);
      }
    }
  };

  // MetaMaskιΎζ₯
  const handleMetaMaskClick = () => {
    setLoading(true);
    if (!connectedAccount) {
      connectWallect((account: string | null) => {
        if (account) {
          onloginRequest(account);
        } else {
          setLoading(false);
        }
      });
    }
    onloginRequest(connectedAccount || '');
  };
  return (
    <WalletListContainer>
      <WalletItemContainer onClick={handleMetaMaskClick}>
        <div className='name-box'>
          <Image
            alt='Wallet'
            height={24}
            src='/static/icon/metamask-icon.png'
            width={24}
          />
          <span>MetaMask</span>
        </div>
        {loading ? (
          <div className='loading-box'>
            <Loading size='mini' />
          </div>
        ) : null}
      </WalletItemContainer>
      <WalletItemContainer>
        <div className='name-box'>
          <Image
            alt='Wallet'
            height={24}
            src='/static/icon/wallet-connect-icon.png'
            width={24}
          />
          <span>Wallet Connect</span>
        </div>
        <div className='tip-box'>Coming Soon</div>
      </WalletItemContainer>
    </WalletListContainer>
  );
});
Wallet.displayName = 'Wallet';

const User = memo(() => {
  const router = useRouter();
  const [user, setUser] = useRecoilState(userState);
  const {disconnectWallect} = useMetaMask();

  // θ·³θ½¬
  const handleGoClick = (url: string) => {
    // if (!connectedAccount) {
    //     connectWallect()
    //     return
    // }
    router.push(url);
  };

  // ιεΊη»ε½
  const handleLogoutClick = async () => {
    disconnectWallect();
    const res: any = await onLogout();
    if (res?.code === 0) {
      localStorage.removeItem('x-token');
      setUser({
        expiresAt: null,
        portrait: null,
        token: null,
        username: null,
        userId: null,
        accountAddress: null,
      });
      showTip({type: IMessageType.SUCCESS, content: 'Log out successfully!'});
    }
  };

  return (
    <UserListContainer>
      <Auth>
        <UserItemContainer
          onClick={() => {
            handleGoClick(`/user/profile/${user.userId}`);
          }}
        >
          <div className='name-box'>
            <SvgIcon
              color='#333333'
              height={24}
              name='profile-icon'
              width={24}
            />
            <span>Profile</span>
          </div>
        </UserItemContainer>
      </Auth>
      <Auth>
        <UserItemContainer
          onClick={() => {
            handleGoClick(`/user/profile/${user.userId}?type=favorite`);
          }}
        >
          <div className='name-box'>
            <SvgIcon color='#333333' height={24} name='love-icon' width={24} />
            <span>Favorite</span>
          </div>
        </UserItemContainer>
      </Auth>
      {/* <UserItemContainer>
                <div className="name-box">
                    <Image
                        src={'/static/icon/user-fund-icon.png'}
                        alt='Crowdfund'
                        width={24}
                        height={24}
                    />
                    <SvgIcon name='crowdfun-icon' width={24} height={24} color={'#333333'} />
                    <span>Crowdfund</span>
                </div>
            </UserItemContainer> */}
      {user.token ? (
        <UserItemContainer onClick={handleLogoutClick}>
          <div className='name-box'>
            <SvgIcon
              color='#333333'
              height={24}
              name='logout-icon'
              width={24}
            />
            <span>Log Out</span>
          </div>
        </UserItemContainer>
      ) : null}
    </UserListContainer>
  );
});
User.displayName = 'User';

export default Header;
