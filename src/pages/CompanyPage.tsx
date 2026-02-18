import '../framer/styles.css'
import NavBarFramerComponent from '../framer/header/nav-bar'
import FooterWithDisclaimer from '../components/FooterWithDisclaimer'

export default function CompanyPage() {
    return (
        <div className='flex flex-col items-center gap-12 md:gap-16 lg:gap-20 bg-[rgb(255,_255,_255)] pt-8 md:pt-12'>
            <NavBarFramerComponent.Responsive />
            <div className="w-full max-w-[1200px] px-4">
                <h1 className="text-4xl font-bold text-center">Company</h1>
            </div>
            <FooterWithDisclaimer />
        </div>
    );
}
